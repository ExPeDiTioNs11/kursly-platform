import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';
import { CourseLevel, CourseStatus } from '@kursly/shared';

export class CreateCourseDto {
  @ApiProperty({ example: 'Full-Stack TypeScript' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'fullstack-typescript' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens',
  })
  slug!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ enum: CourseLevel, required: false, default: CourseLevel.BEGINNER })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiProperty({ enum: CourseStatus, required: false, default: CourseStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({ required: false, default: 0, description: 'Price in minor units (cents)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
