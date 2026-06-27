import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { FollowsService } from './follows.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/pagination';

@ApiTags('follows')
@ApiBearerAuth()
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('following')
  @ApiOperation({ summary: 'List users the current user follows' })
  following(@CurrentUser() user: JwtPayload) {
    return this.followsService.listFollowing(user.sub);
  }

  @Get('followers')
  @ApiOperation({ summary: 'List the current user’s followers' })
  followers(@CurrentUser() user: JwtPayload) {
    return this.followsService.listFollowers(user.sub);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'List users a given user follows (paginated)' })
  userFollowing(@Param('userId') userId: string, @Query() q: PaginationQueryDto) {
    return this.followsService.pageFollowing(userId, q.page ?? 1, q.pageSize ?? 20);
  }

  @Get(':userId/followers')
  @ApiOperation({ summary: 'List a given user’s followers (paginated)' })
  userFollowers(@Param('userId') userId: string, @Query() q: PaginationQueryDto) {
    return this.followsService.pageFollowers(userId, q.page ?? 1, q.pageSize ?? 20);
  }

  @Post(':userId')
  @ApiOperation({ summary: 'Follow a user' })
  follow(@CurrentUser() user: JwtPayload, @Param('userId') userId: string) {
    return this.followsService.follow(user.sub, userId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Unfollow a user' })
  unfollow(@CurrentUser() user: JwtPayload, @Param('userId') userId: string) {
    return this.followsService.unfollow(user.sub, userId);
  }
}
