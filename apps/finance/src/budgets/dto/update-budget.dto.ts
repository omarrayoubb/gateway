import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodType, BudgetStatus } from '../entities/budget.entity';

export class BudgetPeriodDto {
  @IsString()
  period: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  organization_id?: string;

  @IsOptional()
  @IsString()
  budget_name?: string;

  @IsOptional()
  @IsNumber()
  fiscal_year?: number;

  @IsOptional()
  @IsEnum(PeriodType)
  period_type?: PeriodType;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  project_id?: string;

  @IsOptional()
  @IsString()
  account_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget_amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetPeriodDto)
  periods?: BudgetPeriodDto[];
}

