import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { VendorStatus } from '../entities/vendor.entity';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

