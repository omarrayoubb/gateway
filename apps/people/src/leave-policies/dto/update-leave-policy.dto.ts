import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class UpdateLeavePolicyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  maxCarryForwardDays?: number;

  @IsNumber()
  @IsOptional()
  accrualRate?: number;
}

