import { IsString, IsUUID, IsOptional } from 'class-validator';

export class DepreciationPaginationDto {
  @IsUUID()
  @IsOptional()
  asset_id?: string;

  @IsString()
  @IsOptional()
  period_start?: string;

  @IsString()
  @IsOptional()
  period_end?: string;
}

