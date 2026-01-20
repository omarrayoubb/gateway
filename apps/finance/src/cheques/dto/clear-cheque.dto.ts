import { IsDateString, IsOptional } from 'class-validator';

export class ClearChequeDto {
  @IsDateString()
  @IsOptional()
  clear_date?: string;
}

