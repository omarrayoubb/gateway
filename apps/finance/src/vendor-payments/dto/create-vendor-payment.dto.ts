import { IsString, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorPaymentMethod } from '../entities/vendor-payment.entity';

export class CreateVendorPaymentAllocationDto {
  @IsUUID()
  bill_id: string;

  @IsNumber()
  amount: number;
}

export class CreateVendorPaymentDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsOptional()
  payment_number?: string;

  @IsString()
  vendor_id: string;

  @IsDateString()
  payment_date: string;

  @IsEnum(VendorPaymentMethod)
  payment_method: VendorPaymentMethod;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUUID()
  @IsOptional()
  bank_account_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVendorPaymentAllocationDto)
  @IsOptional()
  allocations?: CreateVendorPaymentAllocationDto[];
}

