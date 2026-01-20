import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { TaxType } from '../entities/tax-configuration.entity';

export class TaxConfigurationPaginationDto {
  @IsEnum(TaxType)
  @IsOptional()
  tax_type?: TaxType;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  sort?: string;
}

