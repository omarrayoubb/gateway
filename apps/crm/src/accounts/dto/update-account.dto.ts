import { IsString, IsOptional, IsUUID, IsUrl, IsEmpty, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';

/**
 * DTO for validating Account updates.
 * All fields are optional.
 */
export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;

  // --- NEW FIELD (Read-Only) ---
  @IsEmpty({ message: 'Account Number cannot be changed' })
  accountNumber?: string;

  @IsString()
  @IsOptional()
  billing_street?: string;

  @IsString()
  @IsOptional()
  billing_city?: string;
  
  @IsString()
  @IsOptional()
  billing_state?: string;
  
  @IsString()
  @IsOptional()
  billing_zip?: string;
  
  @IsString()
  @IsOptional()
  billing_country?: string;

  @IsString()
  @IsOptional()
  shipping_street?: string;
  
  @IsString()
  @IsOptional()
  shipping_city?: string;
  
  @IsString()
  @IsOptional()
  shipping_state?: string;
  
  @IsString()
  @IsOptional()
  shipping_zip?: string;
  
  @IsString()
  @IsOptional()
  shipping_country?: string;

  // --- Business Classification Fields ---
  @IsString()
  @IsOptional()
  territory?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  accountType?: string;

  @IsString()
  @IsOptional()
  ownership?: string;
  
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  @IsOptional()
  userIds?: string[];

  // --- NEWLY ADDED ---
  @IsUUID()
  @IsOptional()
  parentAccountId?: string;
}