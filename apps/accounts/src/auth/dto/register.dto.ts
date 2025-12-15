import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsUUID } from 'class-validator';

/**
 * This DTO defines the shape of the body for a registration request.
 * It's very strict to ensure all required data is present.
 */
export class RegisterUserDto {
  // Required fields
  @IsString()
  @IsNotEmpty()
  workId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  workLocation: string;

  // Optional - roles are managed in CRM
  @IsUUID()
  @IsOptional()
  roleId?: string;

  // Password with strength validation
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  // Optional fields (can be null or omitted)
  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  deptManager?: string;

  // We use IsString here because 'date' types from JSON are strings
  @IsString()
  @IsOptional()
  birthday?: string;

  // Optional - profiles are managed in CRM
  @IsUUID()
  @IsOptional()
  profileId?: string;
}