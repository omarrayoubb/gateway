import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AccruedExpenseStatus } from '../entities/accrued-expense.entity';

export class AccruedExpensePaginationDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(AccruedExpenseStatus)
  status?: AccruedExpenseStatus;
}

