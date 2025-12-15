import { IsString, IsEnum, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentType, ShipmentStatus } from '../entities/shipment.entity';
import { CreateShipmentItemDto } from './create-shipment-item.dto';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  shipmentNumber: string;

  @IsEnum(ShipmentType)
  type: ShipmentType;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  @IsOptional()
  toWarehouseId?: string;

  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  carrier?: string;

  @IsDateString()
  shipmentDate: string;

  @IsDateString()
  @IsOptional()
  expectedDelivery?: string;

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

