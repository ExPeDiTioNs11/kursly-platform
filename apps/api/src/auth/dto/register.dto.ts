import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@kursly/shared';

export class RegisterDto {
  @ApiProperty({ example: 'student@kursly.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Sam Student' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: Role, required: false, default: Role.STUDENT })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
