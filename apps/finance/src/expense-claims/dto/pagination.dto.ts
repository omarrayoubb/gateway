import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ExpenseClaimStatus } from '../entities/expense-claim.entity';

export class ExpenseClaimPaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(ExpenseClaimStatus)
  status?: ExpenseClaimStatus;

  @IsOptional()
  @IsString()
  employee_id?: string;
}

