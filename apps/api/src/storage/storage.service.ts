import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { PresignedUpload } from '@kursly/shared';

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

  constructor(private readonly config: ConfigService) {
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
   * Resolve a playback URL for a stored object. Uses the public base URL when
   * the bucket is public, otherwise falls back to a presigned GET URL.
   */
  async getPlaybackUrl(key: string): Promise<string> {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: this.presignExpiresIn });
  }

  private buildKey(filename: string): string {
    const safe = filename.replace(/[^\w.-]+/g, '-').toLowerCase();
    // Prefix with a coarse partition to keep the bucket browsable.
    const prefix = Math.random().toString(36).slice(2, 10);
    return `uploads/${prefix}-${safe}`;
  }
}
