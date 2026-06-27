import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { FeedService } from './feed.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('feed')
@ApiBearerAuth()
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({ summary: 'Aggregated home feed (stories, posts, mini & recommended courses)' })
  getFeed(@CurrentUser() user: JwtPayload) {
    return this.feedService.getFeed(user.sub);
  }
}
