import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Length,
} from 'class-validator';
import { PricingType } from '../entities/pricing.entity';

export class CreatePricingDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  pricing_code?: string;

  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsEnum(PricingType)
  @IsNotEmpty()
  pricing_type: PricingType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  base_price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount_percent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount_amount?: number;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  minimum_quantity?: number;

  @IsDateString()
  @IsNotEmpty()
  effective_date: string;

  @IsDateString()
  @IsOptional()
  expiry_date?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

