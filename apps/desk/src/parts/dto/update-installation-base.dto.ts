import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { CreateInstallationBaseDto } from './create-installation-base.dto';

export class UpdateInstallationBaseDto extends PartialType(
  CreateInstallationBaseDto,
) {
  @IsDateString()
  @IsOptional()
  next_ppm_date?: string;

  @IsNumber()
  @IsOptional()
  total_service_calls?: number;

  @IsNumber()
  @IsOptional()
  total_downtime_hours?: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  lifecycle_status?: string;

  @IsBoolean()
  @IsOptional()
  eol_alert_sent?: boolean;

  @IsDateString()
  @IsOptional()
  eol_alert_date?: string;
}

