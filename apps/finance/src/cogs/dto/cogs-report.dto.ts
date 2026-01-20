import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CogsReportDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsString()
  @IsOptional()
  format?: string;
}

