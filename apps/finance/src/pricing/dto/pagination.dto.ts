import { IsOptional, IsString, IsBoolean, IsUUID, IsDateString } from 'class-validator';

export class PricingPaginationDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsUUID()
  product_id?: string;

  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDateString()
  effective_date?: string;
}

