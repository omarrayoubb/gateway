import { IsOptional, IsInt, Min, Max, IsString, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AlertStatus, AlertSeverity } from '../entities/product-alert.entity';

export class ProductAlertPaginationDto {
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
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @IsOptional()
  @IsString()
  sort?: string;
}

