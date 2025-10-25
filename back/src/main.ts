import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove non-whitelisted properties
    forbidNonWhitelisted: true, // Throw errors for non-whitelisted properties
    transform: true, // Automatically transform payloads to DTO instances
  }));
  app.enableCors({
    origin: ['http://localhost', 'http://localhost:5173'], // or '*' for all origins (not recommended for production)
    credentials: true, // if you use cookies/auth
  });
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(3000);
}
bootstrap();
