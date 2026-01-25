import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateLeavePolicyDto {
  @IsString()
  name: string;

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

