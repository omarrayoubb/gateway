import { IsUUID, IsNotEmpty, IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class CalculatePricingDto {
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsDateString()
  @IsOptional()
  date?: string;
}

