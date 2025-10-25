import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  UseGuards,
  Param,
  Get,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { existsSync } from 'fs';
import { join } from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }

    return {
      message: 'Video uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: this.uploadService.getVideoUrl(file.filename)
    };
  }

  @Get('video/:filename')
  async getVideo(@Param('filename') filename: string, @Res() res: Response) {
    const videoPath = this.uploadService.getVideoPath(filename);
    
    if (!existsSync(videoPath)) {
      throw new BadRequestException('Video not found');
    }

    res.sendFile(videoPath);
  }
} 