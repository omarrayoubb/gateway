import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TaxPayableStatus, TaxType } from '../entities/tax-payable.entity';

export class TaxPayablePaginationDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(TaxPayableStatus)
  status?: TaxPayableStatus;

  @IsOptional()
  @IsEnum(TaxType)
  tax_type?: TaxType;
}

