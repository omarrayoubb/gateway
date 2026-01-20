import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class ExpensePaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  category_id?: string;
}

