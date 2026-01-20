import { IsDateString, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReverseAccruedExpenseDto {
  @IsDateString()
  @IsNotEmpty()
  reversal_date: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

