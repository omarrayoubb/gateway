import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInstallationBaseDto {
  @IsString()
  @IsNotEmpty()
  equipment_name: string;

  @IsString()
  @IsOptional()
  serial_number?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  manufacturer?: string | null;

  @IsString()
  @IsOptional()
  model?: string;

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
  installation_date?: string;

  @IsString()
  @IsOptional()
  installation_location?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsDateString()
  @IsOptional()
  warranty_start_date?: string;

  @IsDateString()
  @IsOptional()
  warranty_end_date?: string;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  @IsIn(['In Use', 'Disposed', 'Sold', 'Returned to Vendor'])
  lifecycle_status?: string;

  @IsNumber()
  @IsOptional()
  expected_lifespan_years?: number;

  @IsDateString()
  @IsOptional()
  next_ppm_date?: string;
}

