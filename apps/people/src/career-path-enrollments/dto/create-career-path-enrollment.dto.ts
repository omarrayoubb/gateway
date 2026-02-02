import { IsUUID, IsDateString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { CareerPathEnrollmentStatus } from '../entities/career-path-enrollment.entity';

export class CreateCareerPathEnrollmentDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  careerPathId: string;

  @IsDateString()
  enrollmentDate: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  currentMilestone?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsEnum(CareerPathEnrollmentStatus)
  @IsOptional()
  status?: CareerPathEnrollmentStatus;
}
