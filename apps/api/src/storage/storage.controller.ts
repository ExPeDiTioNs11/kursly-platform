import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kursly/shared';
import { StorageService } from './storage.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @Get('playback-url')
  @ApiOperation({ summary: 'Resolve a playback URL for a stored video key' })
  async playbackUrl(@Query('key') key: string) {
    return { url: await this.storageService.getPlaybackUrl(key) };
  }
}
