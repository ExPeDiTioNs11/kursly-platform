import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InternshipStatus, Role } from '@kursly/shared';
import type { JwtPayload, Paginated } from '@kursly/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { QueryInternshipsDto } from './dto/query-internships.dto';
import { ApplyDto } from './dto/apply.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class InternshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryInternshipsDto): Promise<Paginated<unknown>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;

    const where: Prisma.InternshipWhereInput = {
      status: InternshipStatus.OPEN,
      ...(query.remote ? { isRemote: true } : {}),
      ...(query.field ? { field: { contains: query.field, mode: 'insensitive' } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.internship.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: this.summaryInclude(),
      }),
      this.prisma.internship.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.toSummary(r)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(user: JwtPayload, id: string) {
    const internship = await this.prisma.internship.findUnique({
      where: { id },
      include: this.summaryInclude(),
    });
    if (!internship) {
      throw new NotFoundException('Internship not found');
    }
    const application = await this.prisma.internshipApplication.findUnique({
      where: { internshipId_applicantId: { internshipId: id, applicantId: user.sub } },
      select: { id: true },
    });
    return {
      ...this.toSummary(internship),
      description: internship.description,
      hasApplied: Boolean(application),
    };
  }

  async findMine(user: JwtPayload) {
    const rows = await this.prisma.internship.findMany({
      where: { companyId: user.sub },
      orderBy: { updatedAt: 'desc' },
      include: this.summaryInclude(),
    });
    return rows.map((r) => this.toSummary(r));
  }

  create(user: JwtPayload, dto: CreateInternshipDto) {
    return this.prisma.internship.create({
      data: {
        companyId: user.sub,
        title: dto.title,
        description: dto.description,
        field: dto.field ?? null,
        location: dto.location ?? null,
        isRemote: dto.isRemote ?? false,
        durationMonths: dto.durationMonths ?? null,
      },
      include: this.summaryInclude(),
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateInternshipDto) {
    await this.assertOwner(user, id);
    return this.prisma.internship.update({
      where: { id },
      data: dto,
      include: this.summaryInclude(),
    });
  }

  async remove(user: JwtPayload, id: string) {
    await this.assertOwner(user, id);
    await this.prisma.internship.delete({ where: { id } });
  }

  /* ────────────── Applications ────────────── */

  async apply(user: JwtPayload, internshipId: string, dto: ApplyDto) {
    const internship = await this.prisma.internship.findUnique({
      where: { id: internshipId },
      select: { id: true, status: true },
    });
    if (!internship) {
      throw new NotFoundException('Internship not found');
    }
    if (internship.status !== InternshipStatus.OPEN) {
      throw new BadRequestException('Bu ilana başvurular kapalı');
    }
    await this.prisma.internshipApplication.upsert({
      where: { internshipId_applicantId: { internshipId, applicantId: user.sub } },
      create: { internshipId, applicantId: user.sub, message: dto.message ?? null },
      update: { message: dto.message ?? null },
    });
    return { applied: true };
  }

  async withdraw(user: JwtPayload, internshipId: string) {
    await this.prisma.internshipApplication.deleteMany({
      where: { internshipId, applicantId: user.sub },
    });
    return { applied: false };
  }

  async listApplicants(user: JwtPayload, internshipId: string) {
    await this.assertOwner(user, internshipId);
    const apps = await this.prisma.internshipApplication.findMany({
      where: { internshipId },
      orderBy: { createdAt: 'desc' },
      include: { applicant: { select: { id: true, name: true, avatarUrl: true } } },
    });
    return apps.map((a) => ({
      id: a.id,
      message: a.message,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      applicant: a.applicant,
    }));
  }

  async updateApplication(user: JwtPayload, applicationId: string, dto: UpdateApplicationDto) {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id: applicationId },
      select: { internshipId: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    await this.assertOwner(user, application.internshipId);
    return this.prisma.internshipApplication.update({
      where: { id: applicationId },
      data: { status: dto.status },
    });
  }

  async myApplications(user: JwtPayload) {
    const apps = await this.prisma.internshipApplication.findMany({
      where: { applicantId: user.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            status: true,
            company: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
    return apps.map((a) => ({
      id: a.id,
      message: a.message,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      internship: a.internship,
    }));
  }

  private async assertOwner(user: JwtPayload, internshipId: string): Promise<void> {
    const internship = await this.prisma.internship.findUnique({
      where: { id: internshipId },
      select: { companyId: true },
    });
    if (!internship) {
      throw new NotFoundException('Internship not found');
    }
    if (user.role !== Role.ADMIN && internship.companyId !== user.sub) {
      throw new ForbiddenException('You do not own this internship');
    }
  }

  private summaryInclude() {
    return {
      company: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { applications: true } },
    } satisfies Prisma.InternshipInclude;
  }

  private toSummary(internship: InternshipWithSummary) {
    return {
      id: internship.id,
      title: internship.title,
      field: internship.field,
      location: internship.location,
      isRemote: internship.isRemote,
      durationMonths: internship.durationMonths,
      status: internship.status,
      company: internship.company,
      applicantCount: internship._count.applications,
      createdAt: internship.createdAt.toISOString(),
    };
  }
}

type InternshipWithSummary = Prisma.InternshipGetPayload<{
  include: {
    company: { select: { id: true; name: true; avatarUrl: true } };
    _count: { select: { applications: true } };
  };
}>;
