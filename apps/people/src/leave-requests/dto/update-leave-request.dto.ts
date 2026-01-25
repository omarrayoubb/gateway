import { IsUUID, IsDateString, IsInt, IsString, IsOptional, IsEnum } from 'class-validator';
import { LeaveRequestStatus } from '../entities/leave-request.entity';

export class UpdateLeaveRequestDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsUUID()
  @IsOptional()
  leaveType?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @IsOptional()
  numberOfDays?: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;
}

