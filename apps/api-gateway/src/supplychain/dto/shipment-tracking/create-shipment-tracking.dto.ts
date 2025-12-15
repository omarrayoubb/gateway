import { IsString, IsUUID, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export enum TrackingUpdateType {
  SYSTEM = 'system',
  MANUAL = 'manual',
}

export class CreateShipmentTrackingDto {
  @IsUUID()
  shipment_id: string;

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
  updated_by?: TrackingUpdateType;

  @IsBoolean()
  @IsOptional()
  is_automated?: boolean;
}

