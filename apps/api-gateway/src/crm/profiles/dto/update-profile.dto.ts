import { IsString, IsOptional, IsObject } from 'class-validator';
import type { ProfilePermissions } from './create-profile.dto';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  permissions?: ProfilePermissions;
}
