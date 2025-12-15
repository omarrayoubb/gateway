import { IsString, IsUUID, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateVendorPerformanceDto {
  @IsUUID()
  vendorId: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  onTimeDeliveryRate?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  qualityScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalOrders?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;
}

