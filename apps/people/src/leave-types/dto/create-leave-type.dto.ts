import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string;

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
}

