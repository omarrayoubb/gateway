import {
  IsDateString,
  IsNumber,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class MakePaymentDto {
  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  payment_amount: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  principal_amount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  interest_amount?: number;

  @IsUUID()
  @IsOptional()
  bank_account_id?: string;
}

