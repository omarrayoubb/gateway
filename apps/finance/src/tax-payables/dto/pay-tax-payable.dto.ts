import {
  IsDateString,
  IsNumber,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class PayTaxPayableDto {
  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  payment_amount: number;

  @IsUUID()
  @IsOptional()
  bank_account_id?: string;
}

