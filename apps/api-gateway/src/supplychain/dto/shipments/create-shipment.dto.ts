import { IsString, IsEnum, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateShipmentItemDto } from './create-shipment-item.dto';

export enum ShipmentType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  shipment_number: string;

  @IsEnum(ShipmentType)
  type: ShipmentType;

  @IsUUID()
  warehouse_id: string;

  @IsUUID()
  @IsOptional()
  to_warehouse_id?: string;

  @IsUUID()
  @IsOptional()
  vendor_id?: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsString()
  @IsOptional()
  tracking_number?: string;

  @IsString()
  @IsOptional()
  carrier?: string;

  @IsDateString()
  shipment_date: string;

  @IsDateString()
  @IsOptional()
  expected_delivery?: string;

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentItemDto)
  items: CreateShipmentItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

