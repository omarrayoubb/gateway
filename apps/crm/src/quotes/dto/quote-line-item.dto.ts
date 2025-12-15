import { IsUUID, IsString, IsNumber, IsOptional } from 'class-validator';

export class QuoteLineItemDto {
  @IsUUID()
  @IsOptional()
  productId?: string;

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
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @IsNumber()
  total: number;
}

