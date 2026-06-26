import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get the current user’s progress across a course' })
  forCourse(@CurrentUser() user: JwtPayload, @Param('courseId') courseId: string) {
    return this.progressService.forCourse(user.sub, courseId);
  }

  @Put('lessons/:lessonId')
  @ApiOperation({ summary: 'Record progress for a lesson' })
  upsert(
    @CurrentUser() user: JwtPayload,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.progressService.upsert(user.sub, lessonId, dto);
  }
}
