import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { FollowsService } from './follows.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
  @ApiOperation({ summary: 'List users a given user follows' })
  userFollowing(@Param('userId') userId: string) {
    return this.followsService.listFollowing(userId);
  }

  @Get(':userId/followers')
  @ApiOperation({ summary: 'List a given user’s followers' })
  userFollowers(@Param('userId') userId: string) {
    return this.followsService.listFollowers(userId);
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
