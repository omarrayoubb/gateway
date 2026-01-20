import { PartialType } from '@nestjs/mapped-types';
import { CreateAccruedExpenseDto } from './create-accrued-expense.dto';
import { IsEnum, IsDateString, IsString, IsOptional } from 'class-validator';
import { AccruedExpenseStatus } from '../entities/accrued-expense.entity';

export class UpdateAccruedExpenseDto extends PartialType(CreateAccruedExpenseDto) {
  @IsEnum(AccruedExpenseStatus)
  @IsOptional()
  status?: AccruedExpenseStatus;

  @IsDateString()
  @IsOptional()
  reversal_date?: string;

  @IsString()
  @IsOptional()
  reversal_reason?: string;
}

