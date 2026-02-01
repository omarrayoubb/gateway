import { IsUUID, IsString, IsEmail, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApplicantStatus } from '../entities/applicant.entity';

export class CreateApplicantDto {
  @IsUUID()
  jobPostingId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsEnum(ApplicantStatus)
  @IsOptional()
  status?: ApplicantStatus;

  @IsDateString()
  appliedDate: string;
}
