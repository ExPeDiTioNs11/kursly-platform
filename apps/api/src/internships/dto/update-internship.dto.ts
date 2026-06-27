import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { InternshipStatus } from '@kursly/shared';
import { CreateInternshipDto } from './create-internship.dto';

export class UpdateInternshipDto extends PartialType(CreateInternshipDto) {
  @ApiPropertyOptional({ enum: InternshipStatus })
  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;
}
