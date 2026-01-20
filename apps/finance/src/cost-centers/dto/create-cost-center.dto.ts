import {
  IsString,
  IsNumber,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Min,
  Length,
} from 'class-validator';

export class CreateCostCenterDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  cost_center_code: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  cost_center_name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  department?: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;

  @IsUUID()
  @IsOptional()
  manager_id?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budgeted_amount?: number;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

