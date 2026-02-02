import { IsUUID, IsDateString, IsString, IsEnum, IsOptional } from 'class-validator';
import { CertificationStatus } from '../entities/employee-certification.entity';

export class CreateEmployeeCertificationDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  certificationId: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  certificateNumber?: string;

  @IsEnum(CertificationStatus)
  @IsOptional()
  status?: CertificationStatus;
}
