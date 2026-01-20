import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ValuationMethod } from '../entities/inventory-valuation.entity';

export class InventoryValuationPaginationDto {
  @IsDateString()
  @IsOptional()
  as_of_date?: string;

  @IsEnum(ValuationMethod)
  @IsOptional()
  valuation_method?: ValuationMethod;
}

