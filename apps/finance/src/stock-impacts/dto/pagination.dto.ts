import { IsDateString, IsOptional } from 'class-validator';

export class StockImpactPaginationDto {
  @IsDateString()
  @IsOptional()
  period_start?: string;

  @IsDateString()
  @IsOptional()
  period_end?: string;
}

