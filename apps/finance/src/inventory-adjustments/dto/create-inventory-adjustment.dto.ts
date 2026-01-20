import { IsString, IsDateString, IsEnum, IsUUID, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { AdjustmentType } from '../entities/inventory-adjustment.entity';

export class CreateInventoryAdjustmentDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsOptional()
  adjustment_number?: string;

  @IsDateString()
  @IsNotEmpty()
  adjustment_date: string;

  @IsEnum(AdjustmentType)
  @IsNotEmpty()
  adjustment_type: AdjustmentType;

  @IsUUID()
  @IsNotEmpty()
  item_id: string;

  @IsNumber()
  @IsOptional()
  quantity_adjusted?: number;

  @IsNumber()
  @IsOptional()
  unit_cost?: number;

  @IsNumber()
  @IsOptional()
  adjustment_amount?: number;

  @IsUUID()
  @IsNotEmpty()
  account_id: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

