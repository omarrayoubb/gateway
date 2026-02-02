import { IsUUID, IsDateString, IsInt, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
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

  @IsNumber()
  @IsOptional()
  numberOfHours?: number;

  @IsString()
  @IsOptional()
  hoursFrom?: string;

  @IsString()
  @IsOptional()
  hoursTo?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;
}

