import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published courses (paginated, filterable)' })
  findAll(@Query() query: QueryCoursesDto) {
    return this.coursesService.findAll(query);
  }

  // Declared before ':slug' so 'mine' is not captured as a slug.
  @Get('mine')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the current instructor’s own courses (all statuses)' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.coursesService.findMine(user);
  }

  @Get(':id/manage')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full editable course detail for its owner/admin' })
  manage(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.manageDetail(user, id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get course detail with sections and lessons' })
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course (instructor/admin)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user, dto);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course you own' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course you own' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.remove(user, id);
  }

  @Post(':id/sections')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a section to a course' })
  addSection(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.coursesService.addSection(user, id, dto);
  }

  @Post('sections/:sectionId/lessons')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a lesson to a section' })
  addLesson(
    @CurrentUser() user: JwtPayload,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.coursesService.addLesson(user, sectionId, dto);
  }

  @Patch('sections/:sectionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a section' })
  updateSection(
    @CurrentUser() user: JwtPayload,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.coursesService.updateSection(user, sectionId, dto);
  }

  @Delete('sections/:sectionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a section' })
  removeSection(@CurrentUser() user: JwtPayload, @Param('sectionId') sectionId: string) {
    return this.coursesService.removeSection(user, sectionId);
  }

  @Patch('lessons/:lessonId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lesson' })
  updateLesson(
    @CurrentUser() user: JwtPayload,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLesson(user, lessonId, dto);
  }

  @Delete('lessons/:lessonId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lesson' })
  removeLesson(@CurrentUser() user: JwtPayload, @Param('lessonId') lessonId: string) {
    return this.coursesService.removeLesson(user, lessonId);
  }
}
