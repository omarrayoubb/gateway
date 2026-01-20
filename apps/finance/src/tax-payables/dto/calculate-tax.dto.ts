import {
  IsString,
  IsNotEmpty,
  IsEnum,
  Matches,
} from 'class-validator';
import { TaxType } from '../entities/tax-payable.entity';

export class CalculateTaxDto {
  @IsEnum(TaxType)
  @IsNotEmpty()
  tax_type: TaxType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'period must be in format YYYY-MM' })
  period: string;
}

