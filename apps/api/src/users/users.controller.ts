import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@kursly/shared';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiOperation({ summary: 'Update your own profile' })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get a user profile with social counts and follow state' })
  profile(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.getProfile(user.sub, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a public user profile by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findPublicById(id);
  }
}
