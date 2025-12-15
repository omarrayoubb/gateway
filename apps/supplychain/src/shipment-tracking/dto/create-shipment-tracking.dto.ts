import { IsString, IsUUID, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { TrackingUpdateType } from '../entities/shipment-tracking.entity';

export class CreateShipmentTrackingDto {
  @IsUUID()
  shipmentId: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsEnum(TrackingUpdateType)
  @IsOptional()
  updatedBy?: TrackingUpdateType;

  @IsBoolean()
  @IsOptional()
  isAutomated?: boolean;
}

