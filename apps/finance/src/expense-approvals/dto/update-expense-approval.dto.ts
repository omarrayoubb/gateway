import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApprovalStatus } from '../entities/expense-approval.entity';

export class UpdateExpenseApprovalDto {
  @IsOptional()
  @IsString()
  organization_id?: string;

  @IsOptional()
  @IsString()
  expense_id?: string;

  @IsOptional()
  @IsString()
  expense_claim_id?: string;

  @IsOptional()
  @IsString()
  approver_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  approval_level?: number;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsDateString()
  approved_date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

