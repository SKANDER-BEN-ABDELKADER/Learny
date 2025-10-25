import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  constructor() {
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
  }

  getVideoUrl(filename: string): string {
    return `${process.env.API_URL || 'http://localhost:3000'}/uploads/${filename}`;
  }

  getVideoPath(filename: string): string {
    return join(process.cwd(), 'uploads', filename);
  }
} 