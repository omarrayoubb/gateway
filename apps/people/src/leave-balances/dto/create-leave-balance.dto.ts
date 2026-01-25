import { IsUUID, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateLeaveBalanceDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  leaveType: string;

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
  year: number;
}

