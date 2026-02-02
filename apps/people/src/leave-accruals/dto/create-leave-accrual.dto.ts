import { IsUUID, IsDateString, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateLeaveAccrualDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  leaveType: string;

  @IsDateString()
  accrualDate: string;

  @IsNumber()
  daysAccrued: number;

  @IsString()
  @IsOptional()
  description?: string;
}

