import { IsString, IsUUID, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum VendorProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

class PriceTierDto {
  @IsNumber()
  @Min(1)
  min_quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateVendorProductDto {
  @IsUUID()
  vendor_id: string;

  @IsUUID()
  product_id: string;

  @IsString()
  @IsOptional()
  vendor_sku?: string;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minimum_order_quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lead_time_days?: number;

  @IsEnum(VendorProductStatus)
  @IsOptional()
  status?: VendorProductStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  @IsOptional()
  price_tiers?: PriceTierDto[];
}

