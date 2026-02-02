import { IsUUID, IsInt, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { LeaveApprovalStatus } from '../entities/leave-approval.entity';

export class CreateLeaveApprovalDto {
  @IsUUID()
  leaveRequestId: string;

  @IsUUID()
  approverId: string;

  @IsEnum(LeaveApprovalStatus)
  @IsOptional()
  status?: LeaveApprovalStatus;

  @IsInt()
  approvalLevel: number;

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

