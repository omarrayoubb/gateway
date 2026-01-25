import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsUUID()
  employeeId: string;

  @IsEmail()
  @IsOptional()
  employeeEmail?: string;

  @IsDateString()
  date: string;

  @IsDateString()
  @IsOptional()
  checkInTime?: string;

  @IsDateString()
  @IsOptional()
  checkOutTime?: string;

  @IsString()
  @IsOptional()
  checkInLocation?: string;

  @IsString()
  @IsOptional()
  checkOutLocation?: string;

  @IsNumber()
  @IsOptional()
  totalHours?: number;

  @IsNumber()
  @IsOptional()
  overtimeHours?: number;

  @IsBoolean()
  @IsOptional()
  isLate?: boolean;

  @IsNumber()
  @IsOptional()
  lateArrivalMinutes?: number;

  @IsNumber()
  @IsOptional()
  earlyDepartureMinutes?: number;

  @IsNumber()
  @IsOptional()
  deductionAmount?: number;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;
}

