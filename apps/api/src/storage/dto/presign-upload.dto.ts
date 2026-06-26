import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class PresignUploadDto {
  @ApiProperty({ example: 'lesson-intro.mp4' })
  @IsString()
  filename!: string;

  @ApiProperty({
    required: false,
    example: 'video/mp4',
    description: 'MIME type of the upload',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\w.+-]+\/[\w.+-]+$/, { message: 'contentType must be a valid MIME type' })
  contentType?: string;
}
