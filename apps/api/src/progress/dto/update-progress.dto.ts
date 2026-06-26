import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ required: false, default: 0, description: 'Playback position in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  positionSeconds?: number;
}
