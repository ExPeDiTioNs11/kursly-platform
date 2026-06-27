import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'NestJS ile temiz mimari üzerine yeni bir ipucu paylaştım! 🚀' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  @ApiPropertyOptional({ description: 'Optional image attached to the post' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Optional course this post references' })
  @IsOptional()
  @IsString()
  courseId?: string;
}
