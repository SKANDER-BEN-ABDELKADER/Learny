import { Module } from '@nestjs/common';
import { VideoAnalysisService } from './video-analysis.service';

@Module({
  providers: [VideoAnalysisService],
  exports: [VideoAnalysisService],
})
export class VideoAnalysisModule {} 