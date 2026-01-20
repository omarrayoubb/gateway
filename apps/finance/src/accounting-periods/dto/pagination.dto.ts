import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PeriodStatus } from '../entities/accounting-period.entity';

export class AccountingPeriodPaginationDto {
  @IsEnum(PeriodStatus)
  @IsOptional()
  status?: PeriodStatus;

  @IsString()
  @IsOptional()
  year?: string;
}

