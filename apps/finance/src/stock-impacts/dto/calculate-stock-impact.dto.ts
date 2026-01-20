import { IsString, IsDateString, IsArray, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CalculateStockImpactDto {
  @IsDateString()
  @IsNotEmpty()
  period_start: string;

  @IsDateString()
  @IsNotEmpty()
  period_end: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  item_ids?: string[];
}

