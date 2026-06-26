import { randomUUID } from 'node:crypto';
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Role } from '@kursly/shared';
import type { JwtPayload, PresignedUpload } from '@kursly/shared';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Cloudflare R2 is S3-compatible, so we use the AWS S3 SDK pointed at the
 * R2 endpoint. Uploads go directly from the browser via a presigned PUT URL;
 * playback URLs are either public (R2 public bucket) or presigned GETs.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string | undefined;
  private readonly presignExpiresIn: number;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = this.config.get<string>('R2_BUCKET') ?? 'kursly-videos';
    this.publicBaseUrl = this.config.get<string>('R2_PUBLIC_BASE_URL') || undefined;
    this.presignExpiresIn = Number(this.config.get<string>('R2_PRESIGN_EXPIRES_IN') ?? 3600);

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.config.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get<string>('R2_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.config.get<string>('R2_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  /** Generate a presigned PUT URL the client can upload a video to directly. */
  async createUploadUrl(filename: string, contentType?: string): Promise<PresignedUpload> {
    const key = this.buildKey(filename);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.presignExpiresIn,
    });
    return { uploadUrl, key, expiresIn: this.presignExpiresIn };
  }

  /**
   * Resolve a playback URL for a lesson, enforcing access control: preview
   * lessons are open to any authenticated user, but the full video is only
   * served to the course owner, an admin, or an enrolled student. This is the
   * gate that keeps paid course content from leaking to anyone who guesses an
   * object key.
   */
  async getLessonPlaybackUrl(user: JwtPayload, lessonId: string): Promise<{ url: string }> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { select: { course: { select: { id: true, instructorId: true } } } } },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    if (!lesson.videoKey) {
      throw new NotFoundException('Lesson has no video');
    }

    const course = lesson.section.course;
    const isOwnerOrAdmin = user.role === Role.ADMIN || course.instructorId === user.sub;

    if (!lesson.isPreview && !isOwnerOrAdmin) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.sub, courseId: course.id } },
      });
      if (!enrollment) {
        throw new ForbiddenException('You must be enrolled to watch this lesson');
      }
    }

    return { url: await this.resolvePlaybackUrl(lesson.videoKey) };
  }

  /**
   * Resolve a playback URL for a stored object. Uses the public base URL when
   * the bucket is public, otherwise falls back to a presigned GET URL.
   */
  private async resolvePlaybackUrl(key: string): Promise<string> {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: this.presignExpiresIn });
  }

  private buildKey(filename: string): string {
    const safe = filename.replace(/[^\w.-]+/g, '-').toLowerCase();
    // Prefix with a random, collision-free segment to keep the bucket browsable.
    return `uploads/${randomUUID()}-${safe}`;
  }
}
