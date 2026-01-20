import { IsString, IsDateString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { RecurringBillCategory, RecurringBillFrequency } from '../entities/recurring-bill.entity';

export class CreateRecurringBillDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  bill_name: string;

  @IsString()
  vendor_id: string;

  @IsEnum(RecurringBillCategory)
  @IsOptional()
  category?: RecurringBillCategory;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(RecurringBillFrequency)
  frequency: RecurringBillFrequency;

  @IsDateString()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsBoolean()
  @IsOptional()
  auto_create?: boolean;

  @IsUUID()
  account_id: string;
}

