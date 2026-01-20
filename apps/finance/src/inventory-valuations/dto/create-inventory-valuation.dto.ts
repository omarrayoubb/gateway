import { IsString, IsNumber, IsDateString, IsEnum, IsUUID, IsOptional, Min } from 'class-validator';
import { ValuationMethod } from '../entities/inventory-valuation.entity';

export class CreateInventoryValuationDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  item_id: string;

  @IsDateString()
  valuation_date: string;

  @IsEnum(ValuationMethod)
  valuation_method: ValuationMethod;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_cost: number;
}

