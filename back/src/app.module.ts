import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { RatingModule } from './rating/rating.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [DatabaseModule, UserModule, CourseModule, RatingModule, AuthModule, UploadModule, ChatbotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
