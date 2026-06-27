import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Role } from '@kursly/shared';
import type { JwtPayload, StoryGroup } from '@kursly/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';

/** Stories older than this are treated as expired and never returned. */
const STORY_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Hourly job that permanently removes stories past their 24h lifetime. */
  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpired(): Promise<void> {
    const cutoff = new Date(Date.now() - STORY_TTL_MS);
    const { count } = await this.prisma.story.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) {
      this.logger.log(`Purged ${count} expired stories`);
    }
  }

  create(currentUserId: string, dto: CreateStoryDto) {
    return this.prisma.story.create({
      data: {
        authorId: currentUserId,
        mediaUrl: dto.mediaUrl,
        caption: dto.caption ?? null,
      },
    });
  }

  /** Active (< 24h) stories grouped by author, unseen groups first. */
  async listActiveGrouped(currentUserId: string): Promise<StoryGroup[]> {
    const since = new Date(Date.now() - STORY_TTL_MS);
    const stories = await this.prisma.story.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: true } },
        views: { where: { userId: currentUserId }, select: { id: true } },
      },
    });

    const groups = new Map<string, StoryGroup>();
    for (const s of stories) {
      const viewedByMe = s.views.length > 0;
      let group = groups.get(s.authorId);
      if (!group) {
        group = {
          author: { ...s.author, role: s.author.role as Role },
          stories: [],
          hasUnseen: false,
        };
        groups.set(s.authorId, group);
      }
      group.stories.push({
        id: s.id,
        mediaUrl: s.mediaUrl,
        caption: s.caption,
        createdAt: s.createdAt.toISOString(),
        viewedByMe,
      });
      if (!viewedByMe) {
        group.hasUnseen = true;
      }
    }

    // Unseen groups first, then most recently updated.
    return [...groups.values()].sort((a, b) => {
      if (a.hasUnseen !== b.hasUnseen) {
        return a.hasUnseen ? -1 : 1;
      }
      const lastA = a.stories[a.stories.length - 1].createdAt;
      const lastB = b.stories[b.stories.length - 1].createdAt;
      return lastB.localeCompare(lastA);
    });
  }

  async markViewed(currentUserId: string, storyId: string): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true },
    });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    await this.prisma.storyView.upsert({
      where: { storyId_userId: { storyId, userId: currentUserId } },
      create: { storyId, userId: currentUserId },
      update: {},
    });
  }

  async remove(user: JwtPayload, id: string): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    if (user.role !== Role.ADMIN && story.authorId !== user.sub) {
      throw new ForbiddenException('You do not own this story');
    }
    await this.prisma.story.delete({ where: { id } });
  }
}
