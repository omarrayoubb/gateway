import { IsEmail, IsString, IsOptional, IsUUID, IsEmpty } from 'class-validator';

/**
 * DTO for validating contact updates.
 * All fields are optional.
 */
export class UpdateContactDto {
  @IsString()
  @IsOptional()
  salutation?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;
  
  @IsEmpty({ message: 'Email cannot be changed via this endpoint' })
  email?: string; // We forbid changing the email (unique key)

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  mobile_phone?: string;

  @IsString()
  @IsOptional()
  account_name?: string;

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
  
  @IsUUID()
  @IsOptional()
  ownerId?: string; // Allow re-assigning the owner
}