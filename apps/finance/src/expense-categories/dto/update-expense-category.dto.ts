import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateExpenseCategoryDto {
  @IsOptional()
  @IsString()
  organization_id?: string;

  @IsOptional()
  @IsString()
  category_code?: string;

  @IsOptional()
  @IsString()
  category_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  account_id?: string;

  @IsOptional()
  @IsBoolean()
  requires_receipt?: boolean;

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  approval_limit?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

