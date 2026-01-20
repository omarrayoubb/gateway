import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsNotEmpty, Min, IsBoolean } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsNotEmpty()
  account_code: string;

  @IsString()
  @IsNotEmpty()
  account_name: string;

  @IsEnum(AccountType)
  account_type: AccountType;

  @IsString()
  @IsOptional()
  account_subtype?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

