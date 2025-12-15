import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export interface ModulePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface ProfilePermissions {
  [moduleName: string]: ModulePermissions;
}

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  permissions?: ProfilePermissions;
}
