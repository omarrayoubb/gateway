import { IsString, IsUUID, IsArray, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { JobPostingStatus } from '../entities/job-posting.entity';

export class UpdateJobPostingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  requirements?: string[];

  @IsEnum(JobPostingStatus)
  @IsOptional()
  status?: JobPostingStatus;

  @IsDateString()
  @IsOptional()
  postedDate?: string;

  @IsDateString()
  @IsOptional()
  closingDate?: string;
}
