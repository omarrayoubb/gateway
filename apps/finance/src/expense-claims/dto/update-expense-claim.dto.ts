import { IsString, IsOptional, IsDateString, IsArray, IsUUID, IsEnum } from 'class-validator';
import { ExpenseClaimStatus } from '../entities/expense-claim.entity';

export class UpdateExpenseClaimDto {
  @IsOptional()
  @IsString()
  organization_id?: string;

  @IsOptional()
  @IsString()
  claim_number?: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsDateString()
  claim_date?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  expense_ids?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ExpenseClaimStatus)
  status?: ExpenseClaimStatus;
}

