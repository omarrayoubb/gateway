import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  Min,
} from 'class-validator';

export enum ProductType {
  SINGLE = 'single',
  KIT = 'kit',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

export enum ProductTemperature {
  ROOM_TEMPERATURE = 'Room temperature',
  FOUR_TO_EIGHT = '4-8',
  MINUS_TWENTY = '-20',
  MINUS_EIGHTY = '-80',
}

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
  category_id?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  selling_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reorder_point?: number;

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
  unit_of_measure?: string;

  @IsUUID()
  @IsOptional()
  default_warehouse_id?: string;

  @IsEnum(ProductTemperature)
  @IsOptional()
  temperature?: ProductTemperature;
}

