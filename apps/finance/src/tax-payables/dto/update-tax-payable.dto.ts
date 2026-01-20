import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxPayableDto } from './create-tax-payable.dto';
import { IsEnum, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { TaxPayableStatus } from '../entities/tax-payable.entity';

export class UpdateTaxPayableDto extends PartialType(CreateTaxPayableDto) {
  @IsEnum(TaxPayableStatus)
  @IsOptional()
  status?: TaxPayableStatus;

  @IsDateString()
  @IsOptional()
  paid_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paid_amount?: number;
}

