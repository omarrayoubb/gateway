import { IsString, IsInt, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';
import { CourseStatus, DeliveryMode } from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  instructor?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationHours?: number;

  @IsEnum(DeliveryMode)
  @IsOptional()
  deliveryMode?: DeliveryMode;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerParticipant?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
