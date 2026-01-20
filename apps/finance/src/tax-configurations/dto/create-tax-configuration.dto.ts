import { IsString, IsEnum, IsNumber, IsBoolean, IsArray, IsUUID, IsOptional, IsDateString, IsNotEmpty, Min, Max } from 'class-validator';
import { TaxType, CalculationMethod } from '../entities/tax-configuration.entity';

export class CreateTaxConfigurationDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsNotEmpty()
  tax_code: string;

  @IsString()
  @IsNotEmpty()
  tax_name: string;

  @IsEnum(TaxType)
  @IsNotEmpty()
  tax_type: TaxType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax_rate?: number;

  @IsEnum(CalculationMethod)
  @IsNotEmpty()
  calculation_method: CalculationMethod;

  @IsBoolean()
  @IsOptional()
  is_inclusive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applies_to?: string[];

  @IsUUID()
  @IsNotEmpty()
  account_id: string;

  @IsDateString()
  @IsOptional()
  effective_from?: string;

  @IsDateString()
  @IsOptional()
  effective_to?: string;
}

