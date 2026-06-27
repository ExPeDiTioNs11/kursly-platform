import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateInternshipDto {
  @ApiProperty({ example: 'Frontend Geliştirme Stajyeri' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'React ve TypeScript ile arayüz geliştirme deneyimi kazan.' })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiPropertyOptional({ example: 'Yazılım Geliştirme' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({ example: 'İstanbul' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  durationMonths?: number;
}
