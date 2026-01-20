import { IsOptional, IsDateString } from 'class-validator';

export class AccountLedgerQueryDto {
  @IsDateString()
  @IsOptional()
  period_start?: string;

  @IsDateString()
  @IsOptional()
  period_end?: string;
}

