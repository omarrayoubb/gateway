import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DepositChequeDto {
  @IsDateString()
  @IsOptional()
  deposit_date?: string;

  @IsUUID()
  bank_account_id: string;
}

