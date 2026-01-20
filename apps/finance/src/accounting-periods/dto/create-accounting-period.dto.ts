import { IsString, IsEnum, IsDateString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { PeriodType } from '../entities/accounting-period.entity';

export class CreateAccountingPeriodDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsNotEmpty()
  period_name: string;

  @IsEnum(PeriodType)
  @IsNotEmpty()
  period_type: PeriodType;

  @IsDateString()
  @IsNotEmpty()
  period_start: string;

  @IsDateString()
  @IsNotEmpty()
  period_end: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

