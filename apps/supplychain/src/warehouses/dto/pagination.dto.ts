import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { WarehouseStatus } from '../entities/warehouse.entity';

export class WarehousePaginationDto {
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
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;

  @IsOptional()
  @IsString()
  temperature_controlled?: string;
}

