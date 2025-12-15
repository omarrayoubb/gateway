import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsDateString,
  Min,
} from 'class-validator';
import { BatchStatus } from '../entities/inventory-batch.entity';

export class CreateInventoryBatchDto {
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsUUID()
  @IsNotEmpty()
  warehouse_id: string;

  @IsString()
  @IsNotEmpty()
  batch_number: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity_available: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unit_cost: number;

  @IsDateString()
  @IsOptional()
  manufacturing_date?: string;

  @IsDateString()
  @IsOptional()
  expiry_date?: string;

  @IsDateString()
  @IsOptional()
  received_date?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;
}

