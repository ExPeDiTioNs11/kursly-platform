import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyDto {
  @ApiPropertyOptional({ description: 'Optional cover message to the company' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
