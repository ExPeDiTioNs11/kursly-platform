import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { ReviewsService } from './reviews.service';
import { UpsertReviewDto } from './dto/upsert-review.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/pagination';

@ApiTags('reviews')
@Controller('courses/:courseId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List reviews for a course (paginated)' })
  list(@Param('courseId') courseId: string, @Query() q: PaginationQueryDto) {
    return this.reviewsService.listForCourse(courseId, q.page ?? 1, q.pageSize ?? 20);
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update your review (must be enrolled)' })
  upsert(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: UpsertReviewDto,
  ) {
    return this.reviewsService.upsert(user.sub, courseId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete your review' })
  remove(@CurrentUser() user: JwtPayload, @Param('courseId') courseId: string) {
    return this.reviewsService.remove(user.sub, courseId);
  }
}
