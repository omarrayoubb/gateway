import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { ChequeType } from '../entities/cheque.entity';

export class CreateChequeDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  cheque_number: string;

  @IsEnum(ChequeType)
  type: ChequeType;

  @IsDateString()
  cheque_date: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  payee_name: string;

  @IsString()
  @IsOptional()
  bank_name?: string;

  @IsUUID()
  @IsOptional()
  bank_account_id?: string;
}

