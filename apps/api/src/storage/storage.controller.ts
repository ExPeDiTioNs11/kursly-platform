import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { StorageService } from './storage.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign-upload')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get a presigned URL to upload a lesson video to R2' })
  presignUpload(@Body() dto: PresignUploadDto) {
    return this.storageService.createUploadUrl(dto.filename, dto.contentType);
  }

  @Get('lessons/:lessonId/playback-url')
  @ApiOperation({
    summary: 'Resolve a playback URL for a lesson (preview, owner/admin, or enrolled only)',
  })
  playbackUrl(@CurrentUser() user: JwtPayload, @Param('lessonId') lessonId: string) {
    return this.storageService.getLessonPlaybackUrl(user, lessonId);
  }
}
