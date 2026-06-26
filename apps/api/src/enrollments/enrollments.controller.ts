import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { EnrollmentsService } from './enrollments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user’s enrollments' })
  list(@CurrentUser() user: JwtPayload) {
    return this.enrollmentsService.listForUser(user.sub);
  }

  @Post(':courseId')
  @ApiOperation({ summary: 'Enroll the current user in a course' })
  enroll(@CurrentUser() user: JwtPayload, @Param('courseId') courseId: string) {
    return this.enrollmentsService.enroll(user.sub, courseId);
  }

  @Delete(':courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unenroll the current user from a course' })
  unenroll(@CurrentUser() user: JwtPayload, @Param('courseId') courseId: string) {
    return this.enrollmentsService.unenroll(user.sub, courseId);
  }
}
