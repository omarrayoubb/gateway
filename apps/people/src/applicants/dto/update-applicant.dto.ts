import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApplicantStatus } from '../entities/applicant.entity';

export class UpdateApplicantDto {
  @IsEnum(ApplicantStatus)
  @IsOptional()
  status?: ApplicantStatus;

  @IsDateString()
  @IsOptional()
  interviewDate?: string;

  @IsString()
  @IsOptional()
  interviewNotes?: string;
}
