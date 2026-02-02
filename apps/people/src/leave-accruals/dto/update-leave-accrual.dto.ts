import { IsUUID, IsDateString, IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateLeaveAccrualDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsUUID()
  @IsOptional()
  leaveType?: string;

  @IsDateString()
  @IsOptional()
  accrualDate?: string;

  @IsNumber()
  @IsOptional()
  daysAccrued?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

