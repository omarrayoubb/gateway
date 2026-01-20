import { IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { AccountType } from '../../accounts/entities/account.entity';

export class GeneralLedgerReportQueryDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsEnum(AccountType)
  @IsOptional()
  account_type?: AccountType;

  @IsString()
  @IsOptional()
  format?: string;
}

