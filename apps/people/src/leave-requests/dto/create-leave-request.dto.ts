import { IsUUID, IsDateString, IsInt, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
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

