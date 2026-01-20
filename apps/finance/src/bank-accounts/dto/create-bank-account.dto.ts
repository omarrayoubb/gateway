import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { BankAccountType } from '../entities/bank-account.entity';

export class CreateBankAccountDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  account_name: string;

  @IsString()
  account_number: string;

  @IsString()
  bank_name: string;

  @IsEnum(BankAccountType)
  account_type: BankAccountType;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  opening_balance?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

