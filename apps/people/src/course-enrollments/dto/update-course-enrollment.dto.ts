import { IsDateString, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { EnrollmentStatus } from '../entities/course-enrollment.entity';

export class UpdateCourseEnrollmentDto {
  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
