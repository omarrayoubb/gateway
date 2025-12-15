import { IsEmail, IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for validating new contact creation.
 * We only require the absolute minimum.
 */
export class CreateContactDto {
  @IsString()
  @IsOptional()
  salutation?: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // --- ALL OTHER FIELDS ARE OPTIONAL ---
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  mobile_phone?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  governmentCode?: string;

  @IsString()
  @IsOptional()
  territory?: string;
  
  @IsString()
  @IsOptional()
  secondary_phone?: string;

  @IsString()
  @IsOptional()
  assistant_name?: string;

  @IsString()
  @IsOptional()
  currency_code?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  wp_number?: string;

  @IsString()
  @IsOptional()
  box_folder_id?: string;

  @IsString()
  @IsOptional()
  assigned_profile?: string;

  @IsString()
  @IsOptional()
  user_permissions?: string;

  @IsString()
  @IsOptional()
  mailing_street?: string;

  @IsString()
  @IsOptional()
  mailing_city?: string;

  @IsString()
  @IsOptional()
  mailing_state?: string;

  @IsString()
  @IsOptional()
  mailing_zip?: string;

  @IsString()
  @IsOptional()
  mailing_country?: string;
  
  
  @IsOptional()
  ownerId?: string; // Allow setting owner on creation, else defaults to creator
}