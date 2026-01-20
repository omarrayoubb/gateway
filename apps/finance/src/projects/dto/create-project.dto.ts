import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  Length,
} from 'class-validator';
import { ProjectType, ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string; // Can be empty string, will be converted to null in service

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  project_code: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  project_name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectType)
  @IsNotEmpty()
  project_type: ProjectType;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budgeted_amount?: number;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  department?: string;

  @IsUUID()
  @IsOptional()
  project_manager_id?: string;

  @IsUUID()
  @IsOptional()
  cost_center_id?: string;
}

