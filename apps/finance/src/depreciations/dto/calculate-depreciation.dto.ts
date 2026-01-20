import { IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class CalculateDepreciationDto {
  @IsUUID()
  @IsNotEmpty()
  asset_id: string;

  @IsDateString()
  @IsNotEmpty()
  period_start: string;

  @IsDateString()
  @IsNotEmpty()
  period_end: string;
}

