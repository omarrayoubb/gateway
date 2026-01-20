import { IsDateString, IsOptional, IsArray, IsBoolean, IsUUID } from 'class-validator';

export class CalculateCashFlowDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  account_ids?: string[];

  @IsBoolean()
  @IsOptional()
  include_forecast?: boolean;
}

