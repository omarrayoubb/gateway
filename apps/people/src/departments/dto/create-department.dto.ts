import { IsString, IsEmail, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { DepartmentStatus } from '../entities/department.entity';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  @IsOptional()
  managerEmail?: string;

  @IsUUID()
  @IsOptional()
  parentDepartmentId?: string;

  @IsEnum(DepartmentStatus)
  @IsOptional()
  status?: DepartmentStatus;
}

