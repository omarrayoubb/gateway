import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateAttendancePolicyDto {
  @IsString()
  name: string;

  @IsString()
  expectedStartTime: string; // Format: HH:mm

  @IsString()
  expectedEndTime: string; // Format: HH:mm

  @IsNumber()
  @IsOptional()
  gracePeriodMinutes?: number;

  @IsNumber()
  minimumHoursForFullDay: number;

  @IsNumber()
  standardWorkHours: number;

  @IsNumber()
  standardWorkDays: number;

  @IsNumber()
  @IsOptional()
  lateArrivalDeductionPerHour?: number;

  @IsNumber()
  @IsOptional()
  earlyDepartureDeductionPerHour?: number;

  @IsNumber()
  @IsOptional()
  absentDayDeduction?: number;

  @IsNumber()
  @IsOptional()
  halfDayDeduction?: number;

  @IsNumber()
  @IsOptional()
  overtimeMultiplier?: number;
}

