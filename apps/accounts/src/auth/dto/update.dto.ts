import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEmpty, IsUUID } from 'class-validator';

/**
 * This DTO defines the shape of the body for an update request.
 * All fields are optional, so the user only sends what they want to change.
 */
export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  deptManager?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  birthday?: string;

  // --- FIELDS NOT ALLOWED TO BE UPDATED ---
  // We add these so the ValidationPipe will throw an error if they are sent.
  
  @IsEmpty({ message: 'Password cannot be updated from this endpoint' })
  password?: string;

  @IsEmpty({ message: 'Email cannot be updated' })
  email?: string;
  
  @IsEmpty({ message: 'Work ID cannot be updated' })
  workId?: string;
}