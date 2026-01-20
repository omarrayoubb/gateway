import { IsDateString } from 'class-validator';

export class ActualCashFlowDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;
}

