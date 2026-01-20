import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Min,
  Length,
  Matches,
} from 'class-validator';
import { TaxType } from '../entities/tax-payable.entity';

export class CreateTaxPayableDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsEnum(TaxType)
  @IsNotEmpty()
  tax_type: TaxType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'tax_period must be in format YYYY-MM' })
  tax_period: string;

  @IsDateString()
  @IsNotEmpty()
  due_date: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsUUID()
  @IsNotEmpty()
  account_id: string;
}

