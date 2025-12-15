import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum VendorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  contact_person?: string;

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
  tax_id?: string;

  @IsString()
  @IsOptional()
  payment_terms?: string;

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

