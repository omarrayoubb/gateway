import { IsUUID, IsString, IsNumber, IsOptional, IsNotEmpty, ValidateIf } from 'class-validator';

export class RFQLineItemDto {
  // Product ID is required - user selects from products list
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  // Product name is optional - can be auto-filled from product or user can override
  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  productCode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  listPrice?: number;

  @IsNumber()
  @IsOptional()
  requestedDiscountPercent?: number;

  @IsString()
  @IsOptional()
  requestedDiscountReason?: string;

  @IsNumber()
  @IsOptional()
  approvedDiscountPercent?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsUUID()
  @IsOptional()
  productLineId?: string;

  @IsUUID()
  @IsOptional()
  manufacturerId?: string;
}

