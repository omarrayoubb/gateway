import { IsUUID, IsDateString, IsInt, IsString, IsOptional, IsEnum } from 'class-validator';
import { LeaveRequestStatus } from '../entities/leave-request.entity';

export class CreateLeaveRequestDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsUUID()
  leaveType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  numberOfDays: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;
}

