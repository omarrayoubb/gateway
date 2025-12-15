import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsIn,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMaintenanceContractDto {
  @IsString()
  @IsOptional()
  contract_number?: string;

  @IsString()
  @IsNotEmpty()
  contract_name: string;

  @IsString()
  @IsOptional()
  @IsIn(['Preventive Maintenance', 'Corrective Maintenance', 'Full Service'])
  contract_type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Active', 'Inactive', 'Expired'])
  status?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.account_id !== null && o.account_id !== undefined)
  @IsUUID()
  account_id?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.contact_id !== null && o.contact_id !== undefined)
  @IsUUID()
  contact_id?: string | null;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'])
  service_frequency?: string;

  @IsNumber()
  @IsOptional()
  visits_per_year?: number;

  @IsString()
  @IsOptional()
  preferred_day_of_week?: string;

  @IsString()
  @IsOptional()
  preferred_time_slot?: string;

  @IsBoolean()
  @IsOptional()
  auto_schedule_enabled?: boolean;

  @IsString()
  @IsOptional()
  assigned_technician?: string;

  @IsString()
  @IsOptional()
  service_location?: string;

  @IsString()
  @IsOptional()
  special_instructions?: string;

  @IsNumber()
  @IsOptional()
  contract_value?: number;

  @IsString()
  @IsOptional()
  @IsIn(['Monthly', 'Quarterly', 'Annual'])
  billing_frequency?: string;

  @IsBoolean()
  @IsOptional()
  includes_parts?: boolean;

  @IsBoolean()
  @IsOptional()
  includes_labor?: boolean;

  @IsBoolean()
  @IsOptional()
  emergency_coverage?: boolean;

  @IsBoolean()
  @IsOptional()
  auto_renewal?: boolean;

  @IsNumber()
  @IsOptional()
  sla_response_time_hours?: number;
}

