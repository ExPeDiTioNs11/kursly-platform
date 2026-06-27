import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InternshipStatus, Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { InternshipsService } from './internships.service';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateInternshipDto } from './dto/update-internship.dto';

const asUser = (sub: string, role: Role = Role.COMPANY): JwtPayload => ({
  sub,
  email: 'x@x',
  role,
});

describe('InternshipsService', () => {
  it('rejects applications to a closed listing', async () => {
    const prisma = {
      internship: {
        findUnique: jest.fn().mockResolvedValue({ id: 'i1', status: InternshipStatus.CLOSED }),
      },
    };
    const service = new InternshipsService(prisma as unknown as PrismaService);

    await expect(service.apply(asUser('s1', Role.STUDENT), 'i1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws NotFound applying to a missing listing', async () => {
    const prisma = { internship: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new InternshipsService(prisma as unknown as PrismaService);

    await expect(service.apply(asUser('s1', Role.STUDENT), 'i1', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('forbids editing a listing owned by another company', async () => {
    const prisma = {
      internship: { findUnique: jest.fn().mockResolvedValue({ companyId: 'other' }) },
    };
    const service = new InternshipsService(prisma as unknown as PrismaService);

    await expect(
      service.update(asUser('me'), 'i1', { title: 'x' } as UpdateInternshipDto),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws NotFound updating a missing application', async () => {
    const prisma = { internshipApplication: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new InternshipsService(prisma as unknown as PrismaService);

    await expect(
      service.updateApplication(asUser('me'), 'a1', { status: 'ACCEPTED' as never }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
