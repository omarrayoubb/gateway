import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApprovalStatus } from '../entities/expense-approval.entity';

export class CreateExpenseApprovalDto {
  @IsOptional()
  @IsString()
  organization_id?: string;

  @IsOptional()
  @IsString()
  expense_id?: string;

  @IsOptional()
  @IsString()
  expense_claim_id?: string;

  @IsString()
  approver_id: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  approval_level?: number;
}

