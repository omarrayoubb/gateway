import { IsOptional, IsInt, Min, Max, IsString, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BatchStatus } from '../entities/inventory-batch.entity';

export class InventoryBatchPaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsOptional()
  @IsUUID()
  warehouse_id?: string;

  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @IsOptional()
  @IsString()
  batch_number?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

