import {
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { LoanType, PaymentFrequency } from '../entities/loan.entity';

export class CreateLoanDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  loan_number: string;

  @IsString()
  @IsNotEmpty()
  loan_name: string;

  @IsString()
  @IsNotEmpty()
  lender: string;

  @IsEnum(LoanType)
  @IsNotEmpty()
  loan_type: LoanType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  loan_amount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  interest_rate?: number;

  @IsDateString()
  @IsNotEmpty()
  loan_date: string;

  @IsDateString()
  @IsNotEmpty()
  maturity_date: string;

  @IsEnum(PaymentFrequency)
  @IsNotEmpty()
  payment_frequency: PaymentFrequency;

  @IsUUID()
  @IsNotEmpty()
  account_id: string;
}

