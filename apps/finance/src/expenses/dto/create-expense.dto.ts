import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsOptional()
  @IsString()
  organization_id?: string;

  @IsOptional()
  @IsString()
  expense_number?: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsDateString()
  expense_date: string;

  @IsString()
  category_id: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  receipt_url?: string;

  @IsString()
  account_id: string;
}

