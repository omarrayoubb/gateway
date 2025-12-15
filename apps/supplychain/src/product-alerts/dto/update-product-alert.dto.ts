import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { AlertStatus } from '../entities/product-alert.entity';

export class UpdateProductAlertDto {
  @IsEnum(AlertStatus)
  @IsOptional()
  status?: AlertStatus;

  @IsDateString()
  @IsOptional()
  acknowledgedAt?: string;

  @IsDateString()
  @IsOptional()
  resolvedAt?: string;
}

