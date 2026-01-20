import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  Min,
  Length,
} from 'class-validator';

export class CreateAccruedExpenseDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  accrual_number?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  expense_description: string;

  @IsDateString()
  @IsNotEmpty()
  accrual_date: string;

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

  @IsUUID()
  @IsOptional()
  vendor_id?: string;
}

