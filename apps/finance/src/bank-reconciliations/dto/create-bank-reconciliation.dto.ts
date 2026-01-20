import { IsString, IsDateString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateBankReconciliationDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  bank_account_id: string;

  @IsDateString()
  reconciliation_date: string;

  @IsNumber()
  @IsOptional()
  statement_balance?: number;

  @IsNumber()
  @IsOptional()
  outstanding_deposits?: number;

  @IsNumber()
  @IsOptional()
  outstanding_checks?: number;

  @IsNumber()
  @IsOptional()
  bank_charges?: number;

  @IsNumber()
  @IsOptional()
  interest_earned?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

