import { IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class ForecastCashFlowDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsBoolean()
  @IsOptional()
  include_recurring?: boolean;
}

