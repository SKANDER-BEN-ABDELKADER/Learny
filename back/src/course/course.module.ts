import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UploadModule } from '../upload/upload.module';
import { VideoAnalysisModule } from '../video-analysis/video-analysis.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    DatabaseModule, 
    UploadModule,
    VideoAnalysisModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow video files
        const allowedMimeTypes = [
          'video/mp4',
          'video/webm',
          'video/ogg',
          'video/avi',
          'video/mov',
          'video/wmv',
          'video/flv',
          'video/mkv'
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Only video files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
      },
    }),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
