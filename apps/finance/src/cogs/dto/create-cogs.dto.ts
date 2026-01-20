import { IsString, IsNumber, IsDateString, IsUUID, IsOptional, Min } from 'class-validator';

export class CreateCogsDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsUUID()
  item_id: string;

  @IsNumber()
  @Min(0)
  quantity_sold: number;

  @IsNumber()
  @Min(0)
  unit_cost: number;
}

