import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PostsModule } from '../posts/posts.module';
import { StoriesModule } from '../stories/stories.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [PostsModule, StoriesModule, CoursesModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
