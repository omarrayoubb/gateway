import { IsUUID, IsInt, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { LeaveApprovalStatus } from '../entities/leave-approval.entity';

export class UpdateLeaveApprovalDto {
  @IsUUID()
  @IsOptional()
  leaveRequestId?: string;

  @IsUUID()
  @IsOptional()
  approverId?: string;

  @IsEnum(LeaveApprovalStatus)
  @IsOptional()
  status?: LeaveApprovalStatus;

  @IsInt()
  @IsOptional()
  approvalLevel?: number;

  @IsDateString()
  @IsOptional()
  approvedDate?: string;

  @IsDateString()
  @IsOptional()
  rejectedDate?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

