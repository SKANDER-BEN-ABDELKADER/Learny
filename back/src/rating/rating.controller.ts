import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { RatingService } from './rating.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';


@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createRatingDto: Prisma.RatingCreateInput) {
    return this.ratingService.create(createRatingDto);
  }

  @Post('course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT', 'INSTRUCTOR')
  createCourseRating(
    @Param('courseId') courseId: string,
    @Body() body: { value: number; comment?: string },
    @Request() req: any
  ) {
    console.log('Rating request received:', { courseId, body, user: req.user });
    const studentId = req.user.id;
    return this.ratingService.createCourseRating(+courseId, studentId, body.value);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.ratingService.findAll();
  }

  @Get('course/:courseId')
  getCourseRatings(@Param('courseId') courseId: string) {
    return this.ratingService.getCourseRatings(+courseId);
  }

  @Get('course/:courseId/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT', 'INSTRUCTOR')
  getUserRatingForCourse(
    @Param('courseId') courseId: string,
    @Request() req: any
  ) {
    const studentId = req.user.id;
    return this.ratingService.getUserRatingForCourse(+courseId, studentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.ratingService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateRatingDto: Prisma.RatingUpdateInput) {
    return this.ratingService.update(+id, updateRatingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ratingService.remove(+id);
  }
}
