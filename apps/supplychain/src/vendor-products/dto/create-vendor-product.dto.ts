import { IsString, IsUUID, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorProductStatus } from '../entities/vendor-product.entity';

class PriceTierDto {
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateVendorProductDto {
  @IsUUID()
  vendorId: string;

  @IsUUID()
  productId: string;

  @IsString()
  @IsOptional()
  vendorSku?: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minimumOrderQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  leadTimeDays?: number;

  @IsEnum(VendorProductStatus)
  @IsOptional()
  status?: VendorProductStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  @IsOptional()
  priceTiers?: PriceTierDto[];
}

