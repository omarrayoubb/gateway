import { IsString, IsOptional, IsEnum, IsUUID, IsNumber } from 'class-validator';
import { SummaryStatus } from '../entities/attendance-summary.entity';

export class CreateAttendanceSummaryDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  month: string; // Format: YYYY-MM

  @IsNumber()
  @IsOptional()
  daysPresent?: number;

  @IsNumber()
  @IsOptional()
  daysAbsent?: number;

  @IsNumber()
  @IsOptional()
  totalHours?: number;

  @IsNumber()
  @IsOptional()
  lateArrivalsCount?: number;

  @IsNumber()
  @IsOptional()
  overtimeHours?: number;

  @IsNumber()
  @IsOptional()
  totalDeductions?: number;

  @IsEnum(SummaryStatus)
  @IsOptional()
  status?: SummaryStatus;
}

