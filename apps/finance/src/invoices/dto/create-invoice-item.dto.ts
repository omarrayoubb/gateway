import { IsString, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class CreateInvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unit_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Min(0)
  tax_rate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_percent?: number;
}

