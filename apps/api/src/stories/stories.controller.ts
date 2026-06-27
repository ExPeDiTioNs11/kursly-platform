import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('stories')
@ApiBearerAuth()
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active stories (< 24h) grouped by author' })
  list(@CurrentUser() user: JwtPayload) {
    return this.storiesService.listActiveGrouped(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Publish a story' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStoryDto) {
    return this.storiesService.create(user.sub, dto);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a story as viewed' })
  view(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.storiesService.markViewed(user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a story you own' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.storiesService.remove(user, id);
  }
}
