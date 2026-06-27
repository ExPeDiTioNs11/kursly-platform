import { Injectable } from '@nestjs/common';
import { CourseFormat } from '@kursly/shared';
import type { CourseSummary, FeedResponse } from '@kursly/shared';
import { PostsService } from '../posts/posts.service';
import { StoriesService } from '../stories/stories.service';
import { CoursesService } from '../courses/courses.service';

/**
 * Composes the logged-in home screen: the story rail, the first page of feed
 * posts, a row of mini-courses and a row of recommended full courses — in a
 * single round trip.
 */
@Injectable()
export class FeedService {
  constructor(
    private readonly posts: PostsService,
    private readonly stories: StoriesService,
    private readonly courses: CoursesService,
  ) {}

  async getFeed(currentUserId: string): Promise<FeedResponse> {
    const [stories, postsPage, miniCourses, recommended] = await Promise.all([
      this.stories.listActiveGrouped(currentUserId),
      this.posts.findAll({ page: 1, pageSize: 10 }, currentUserId),
      this.courses.findAll({ format: CourseFormat.MINI, pageSize: 8 }),
      this.courses.findAll({ format: CourseFormat.FULL, pageSize: 8 }),
    ]);

    return {
      stories,
      posts: postsPage.items,
      miniCourses: miniCourses.items as CourseSummary[],
      recommendedCourses: recommended.items as CourseSummary[],
    };
  }
}
