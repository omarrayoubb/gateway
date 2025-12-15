import { IsEmail, IsString, IsOptional, IsInt, IsNumber, Min, IsEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * This DTO defines the shape and validation rules for updating a lead.
 * All fields are optional, so the user only sends what they want to change.
 */
export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  salutation?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  shipping_street?: string;

  @IsString()
  @IsOptional()
  billing_city?: string;

  @IsUUID()
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
  
  @IsString()
  @IsOptional()
  ownerId?: string; // Allow re-assigning the owner

  // --- FORBIDDEN FIELDS ---
  // We explicitly block attempts to change the email (unique identifier)
  // or the creator via this endpoint.
  @IsEmpty({ message: 'Email cannot be changed after creation' })
  email?: string;
}