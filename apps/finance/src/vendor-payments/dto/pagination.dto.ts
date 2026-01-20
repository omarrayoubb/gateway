import { IsOptional, IsString, IsEnum } from 'class-validator';
import { VendorPaymentStatus } from '../entities/vendor-payment.entity';

export class VendorPaymentPaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(VendorPaymentStatus)
  status?: VendorPaymentStatus;

  @IsOptional()
  @IsString()
  vendor_id?: string;
}

