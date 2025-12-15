import { IsOptional, IsInt, Min, Max, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from '../entities/stock-movement.entity';

export class StockMovementPaginationDto {
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
  batch_id?: string;

  @IsOptional()
  @IsUUID()
  warehouse_id?: string;

  @IsOptional()
  @IsEnum(MovementType)
  movement_type?: MovementType;

  @IsOptional()
  @IsDateString()
  movement_date?: string;
}

