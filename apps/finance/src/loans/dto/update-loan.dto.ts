import { PartialType } from '@nestjs/mapped-types';
import { CreateLoanDto } from './create-loan.dto';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { LoanStatus } from '../entities/loan.entity';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @IsNumber()
  @IsOptional()
  @Min(0)
  payment_amount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  outstanding_balance?: number;

  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;
}

