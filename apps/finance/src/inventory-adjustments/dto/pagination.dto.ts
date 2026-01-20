import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AdjustmentType } from '../entities/inventory-adjustment.entity';

export class InventoryAdjustmentPaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @IsEnum(AdjustmentType)
  @IsOptional()
  adjustment_type?: AdjustmentType;
}

