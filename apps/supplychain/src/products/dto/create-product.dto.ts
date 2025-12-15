import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ProductType, ProductStatus, ProductTemperature } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductType)
  @IsNotEmpty()
  type: ProductType;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderPoint?: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  gtin?: string;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsUUID()
  @IsOptional()
  defaultWarehouseId?: string;

  @IsEnum(ProductTemperature)
  @IsOptional()
  temperature?: ProductTemperature;
}

