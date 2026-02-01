import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateLeaveTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  quota?: number;

  @IsBoolean()
  @IsOptional()
  carryForward?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  trackInHours?: boolean;
}

