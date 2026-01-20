import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApprovalStatus } from '../entities/expense-approval.entity';

export class ExpenseApprovalPaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  approver_id?: string;
}

