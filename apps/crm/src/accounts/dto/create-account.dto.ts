import { IsString, IsNotEmpty, IsOptional, IsUUID, IsUrl, IsArray, ArrayMinSize } from 'class-validator';

/**
 * DTO for validating new Account creation.
 * 'name' is the only required field.
 */
export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
  // --- NEW REQUIRED FIELD (Auto-generated if not provided) ---
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsNotEmpty() // <-- No longer optional
  billing_street?: string;

  @IsString()
  @IsNotEmpty() // <-- No longer optional
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
  
  // Required field - account must have at least one user assigned
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  userIds: string[];

  // --- NEWLY ADDED ---
  @IsUUID()
  @IsOptional()
  parentAccountId?: string;
}