import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { InternshipsService } from './internships.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { QueryInternshipsDto } from './dto/query-internships.dto';
import { ApplyDto } from './dto/apply.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PaginationQueryDto } from '../common/pagination';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('internships')
@ApiBearerAuth()
@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Get()
  @ApiOperation({ summary: 'List open internships (paginated, filterable)' })
  findAll(@Query() query: QueryInternshipsDto) {
    return this.internshipsService.findAll(query);
  }

  // Literal routes before ':id'.
  @Get('mine')
  @Roles(Role.COMPANY, Role.ADMIN)
  @ApiOperation({ summary: 'List the current company’s own listings (all statuses)' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.internshipsService.findMine(user);
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'List the current user’s applications' })
  myApplications(@CurrentUser() user: JwtPayload) {
    return this.internshipsService.myApplications(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an internship with apply state' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.internshipsService.findOne(user, id);
  }

  @Post()
  @Roles(Role.COMPANY, Role.ADMIN)
  @ApiOperation({ summary: 'Create an internship listing' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInternshipDto) {
    return this.internshipsService.create(user, dto);
  }

  @Patch(':id')
  @Roles(Role.COMPANY, Role.ADMIN)
  @ApiOperation({ summary: 'Update a listing you own' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInternshipDto,
  ) {
    return this.internshipsService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.COMPANY, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a listing you own' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.internshipsService.remove(user, id);
  }

  @Post(':id/apply')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Apply to an internship' })
  apply(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: ApplyDto) {
    return this.internshipsService.apply(user, id, dto);
  }

  @Delete(':id/apply')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Withdraw your application' })
  withdraw(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.internshipsService.withdraw(user, id);
  }

  @Get(':id/applications')
  @Roles(Role.COMPANY, Role.ADMIN)
  @ApiOperation({ summary: 'List applicants for a listing you own (paginated)' })
  applicants(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.internshipsService.listApplicants(user, id, q.page ?? 1, q.pageSize ?? 20);
  }

  @Patch('applications/:appId')
  @Roles(Role.COMPANY, Role.ADMIN)
  @ApiOperation({ summary: 'Accept or reject an application' })
  updateApplication(
    @CurrentUser() user: JwtPayload,
    @Param('appId') appId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.internshipsService.updateApplication(user, appId, dto);
  }
}
