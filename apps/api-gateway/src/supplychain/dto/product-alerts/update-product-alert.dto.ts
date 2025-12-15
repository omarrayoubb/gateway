import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum AlertStatus {
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
}

export class UpdateProductAlertDto {
  @IsEnum(AlertStatus)
  @IsOptional()
  status?: AlertStatus;

  @IsDateString()
  @IsOptional()
  acknowledged_at?: string;

  @IsDateString()
  @IsOptional()
  resolved_at?: string;
}

