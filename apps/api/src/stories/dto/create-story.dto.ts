import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStoryDto {
  @ApiProperty({ description: 'Image or video URL shown in the story' })
  @IsString()
  @MinLength(1)
  mediaUrl!: string;

  @ApiPropertyOptional({ description: 'Optional caption overlaid on the story' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  caption?: string;
}
