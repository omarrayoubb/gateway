import { IsOptional, IsString, IsEnum } from 'class-validator';
import { LoanStatus, LoanType } from '../entities/loan.entity';

export class LoanPaginationDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @IsOptional()
  @IsEnum(LoanType)
  loan_type?: LoanType;
}

