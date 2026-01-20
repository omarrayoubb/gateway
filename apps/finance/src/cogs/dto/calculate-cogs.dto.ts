import { IsString, IsDateString, IsArray, IsUUID, IsOptional } from 'class-validator';

export class CalculateCogsDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  item_ids?: string[];
}

