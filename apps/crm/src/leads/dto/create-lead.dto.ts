import { IsEmail, IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * This DTO defines the shape and validation rules for creating a new lead.
 * The ValidationPipe in main.ts will automatically enforce these rules.
 */
export class CreateLeadDto {
  // --- REQUIRED FIELDS ---
  // If any of these are missing, ValidationPipe will send a 400 Bad Request
  // with a list of the "missing fields".

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  salutation?: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  shipping_street: string;

  @IsString()
  @IsNotEmpty()
  billing_city: string;

  // --- OPTIONAL FIELDS ---

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  product_name?: string;

  @IsString()
  @IsOptional()
  currency_code?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  employee_count?: number;

  @IsString()
  @IsOptional()
  hq_code?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  billing_amount?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  exchange_rate?: number;

  @IsString()
  @IsOptional()
  shipping_street_2?: string;

  @IsString()
  @IsOptional()
  shipping_city?: string;

  @IsString()
  @IsOptional()
  shipping_state?: string;

  @IsString()
  @IsOptional()
  shipping_country?: string;

  @IsString()
  @IsOptional()
  shipping_zip_code?: string;

  @IsString()
  @IsOptional()
  billing_street?: string;

  @IsString()
  @IsOptional()
  billing_street_2?: string;

  @IsString()
  @IsOptional()
  billing_state?: string;

  @IsString()
  @IsOptional()
  billing_country?: string;

  @IsString()
  @IsOptional()
  billing_zip_code?: string;

  // ownerId, createdById, and modifiedById will be set from the logged-in user,
  // not from the DTO body.
}