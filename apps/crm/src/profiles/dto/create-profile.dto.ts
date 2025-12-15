import { IsString, IsNotEmpty, IsObject, ValidateNested, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class ModulePermissionsDto {

  @IsBoolean()
  create: boolean;

  @IsBoolean()
  read: boolean;

  @IsBoolean()
  update: boolean;

  @IsBoolean()
  delete: boolean;
}

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  permissions: Record<string, ModulePermissionsDto>;
}

