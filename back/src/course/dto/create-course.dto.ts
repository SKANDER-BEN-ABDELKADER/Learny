import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hided?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatYouWillLearn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsNumber()
  @Type(() => Number)
  instructorId: number;
} 