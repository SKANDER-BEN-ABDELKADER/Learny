import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Query, Request } from '@nestjs/common';
import { CourseService } from './course.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { VideoAnalysisService } from '../video-analysis/video-analysis.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly uploadService: UploadService,
    private readonly videoAnalysisService: VideoAnalysisService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() videoFile?: Express.Multer.File
  ) {
    console.log('Video file received:', videoFile);
    let videoAnalysis: { whatYouWillLearn?: string[]; requirements?: string[] } | null = null;
    
    if (videoFile) {
      console.log('Video filename:', videoFile.filename);
      console.log('Video originalname:', videoFile.originalname);
      createCourseDto.videoUrl = this.uploadService.getVideoUrl(videoFile.filename);
      console.log('Video URL:', createCourseDto.videoUrl);
      
      // Analyze video to extract learning objectives and requirements
      try {
        const videoPath = this.uploadService.getVideoPath(videoFile.filename);
        videoAnalysis = await this.videoAnalysisService.analyzeVideo(videoPath);
        console.log('Video analysis completed:', videoAnalysis);
      } catch (error) {
        console.error('Video analysis failed:', error);
        // Continue with course creation even if analysis fails
      }
    }
    
    const courseData: Prisma.CourseCreateInput = {
      title: createCourseDto.title,
      description: createCourseDto.description,
      category: createCourseDto.category,
      level: createCourseDto.level,
      price: createCourseDto.price,
      hided: createCourseDto.hided || false,
      videoUrl: createCourseDto.videoUrl,
      whatYouWillLearn: Array.isArray(createCourseDto.whatYouWillLearn) && createCourseDto.whatYouWillLearn.length > 0
        ? createCourseDto.whatYouWillLearn
        : (videoAnalysis?.whatYouWillLearn || []),
      requirements: Array.isArray(createCourseDto.requirements) && createCourseDto.requirements.length > 0
        ? createCourseDto.requirements
        : (videoAnalysis?.requirements || []),
      instructor: {
        connect: { id: createCourseDto.instructorId }
      }
    };
    
    return this.courseService.create(courseData);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('search') search?: string,
    @Query('instructor') instructor?: string
  ) {
    return this.courseService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 6,
      category,
      level,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      search,
      instructor
    });
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Get('me/enrolled')
  @UseGuards(JwtAuthGuard)
  findMyEnrolled(@Request() req: any) {
    return this.courseService.findEnrolledByStudent(req.user.id);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  enroll(@Param('id') id: string, @Request() req: any) {
    const studentId = req.user.id;
    return this.courseService.enrollStudentInCourse(+id, studentId);
  }

  @Get('instructor/:instructorId')
  findByInstructor(@Param('instructorId') instructorId: string) {
    return this.courseService.findByInstructor(+instructorId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async update(
    @Param('id') id: string, 
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() videoFile?: Express.Multer.File
  ) {
    console.log('Update - Video file received:', videoFile);
    let videoAnalysis: { whatYouWillLearn?: string[]; requirements?: string[] } | null = null;
    
    if (videoFile) {
      console.log('Update - Video filename:', videoFile.filename);
      console.log('Update - Video originalname:', videoFile.originalname);
      updateCourseDto.videoUrl = this.uploadService.getVideoUrl(videoFile.filename);
      console.log('Update - Video URL:', updateCourseDto.videoUrl);
      
      // Analyze video to extract learning objectives and requirements
      try {
        const videoPath = this.uploadService.getVideoPath(videoFile.filename);
        videoAnalysis = await this.videoAnalysisService.analyzeVideo(videoPath);
        console.log('Video analysis completed:', videoAnalysis);
      } catch (error) {
        console.error('Video analysis failed:', error);
        // Continue with course update even if analysis fails
      }
    }
    
    const courseData: Prisma.CourseUpdateInput = {
      title: updateCourseDto.title,
      description: updateCourseDto.description,
      category: updateCourseDto.category,
      level: updateCourseDto.level,
      price: updateCourseDto.price,
      hided: updateCourseDto.hided,
      videoUrl: updateCourseDto.videoUrl,
      whatYouWillLearn: videoAnalysis?.whatYouWillLearn || updateCourseDto.whatYouWillLearn,
      requirements: videoAnalysis?.requirements || updateCourseDto.requirements,
    };
    
    return this.courseService.update(+id, courseData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}

