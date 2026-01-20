import { IsOptional, IsUUID, IsDateString, IsString, IsEnum } from 'class-validator';
import { TransactionType } from '../entities/general-ledger.entity';
import { AccountType } from '../../accounts/entities/account.entity';

export class GeneralLedgerQueryDto {
  @IsUUID()
  @IsOptional()
  account_id?: string;

  @IsDateString()
  @IsOptional()
  period_start?: string;

  @IsDateString()
  @IsOptional()
  period_end?: string;

  @IsString()
  @IsOptional()
  sort?: string;
}

export class GeneralLedgerAccountQueryDto {
  @IsDateString()
  @IsOptional()
  period_start?: string;

  @IsDateString()
  @IsOptional()
  period_end?: string;
}

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
