import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { BankTransactionType } from '../entities/bank-transaction.entity';

export class CreateBankTransactionDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  bank_account_id: string;

  @IsDateString()
  transaction_date: string;

  @IsEnum(BankTransactionType)
  transaction_type: BankTransactionType;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

