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
import type { JwtPayload } from '@kursly/shared';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'List feed posts (paginated, filterable by author/role)' })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryPostsDto) {
    return this.postsService.findAll(query, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a feed post' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a post you own' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post you own' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.postsService.remove(user, id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  like(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.postsService.like(user.sub, id);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Remove your like from a post' })
  unlike(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.postsService.unlike(user.sub, id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'List a post’s comments' })
  listComments(@Param('id') id: string) {
    return this.postsService.listComments(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Comment on a post' })
  addComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(user.sub, id, dto);
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Edit a comment you own' })
  updateComment(
    @CurrentUser() user: JwtPayload,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.postsService.updateComment(user, commentId, dto);
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment you own' })
  removeComment(@CurrentUser() user: JwtPayload, @Param('commentId') commentId: string) {
    return this.postsService.removeComment(user, commentId);
  }
}
