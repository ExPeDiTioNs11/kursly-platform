import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_RATING, MIN_RATING } from '@kursly/shared';

export class UpsertReviewDto {
  @ApiProperty({ minimum: MIN_RATING, maximum: MAX_RATING, example: 5 })
  @IsInt()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  rating!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
