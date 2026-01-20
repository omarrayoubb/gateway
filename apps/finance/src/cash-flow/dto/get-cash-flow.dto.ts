import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GetCashFlowDto {
  @IsDateString()
  @IsOptional()
  period_start?: string;

  @IsDateString()
  @IsOptional()
  period_end?: string;

  @IsString()
  @IsOptional()
  account_type?: string;
}

