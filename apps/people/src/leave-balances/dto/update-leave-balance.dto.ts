import { IsUUID, IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateLeaveBalanceDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsUUID()
  @IsOptional()
  leaveType?: string;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsNumber()
  @IsOptional()
  used?: number;

  @IsNumber()
  @IsOptional()
  accrued?: number;

  @IsNumber()
  @IsOptional()
  carriedForward?: number;

  @IsInt()
  @IsOptional()
  year?: number;
}

