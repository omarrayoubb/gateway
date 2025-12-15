import { IsOptional, IsString, IsEnum, IsInt, Min, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentStatus, ShipmentType } from '../entities/shipment.entity';

export class ShipmentPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @IsOptional()
  @IsEnum(ShipmentType)
  type?: ShipmentType;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsDateString()
  shipmentDate?: string;
}

