import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class CreateCashAccountDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  account_name: string;

  @IsString()
  account_code: string;

  @IsString()
  @IsOptional()
  location?: string;

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

