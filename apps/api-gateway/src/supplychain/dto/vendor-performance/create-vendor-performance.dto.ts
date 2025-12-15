import { IsString, IsUUID, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateVendorPerformanceDto {
  @IsUUID()
  vendor_id: string;

  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  on_time_delivery_rate?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  quality_score?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  total_orders?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  total_amount?: number;
}

