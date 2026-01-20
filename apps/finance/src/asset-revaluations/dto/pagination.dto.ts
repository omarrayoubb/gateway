import { IsString, IsUUID, IsOptional } from 'class-validator';

export class AssetRevaluationPaginationDto {
  @IsUUID()
  @IsOptional()
  asset_id?: string;

  @IsString()
  @IsOptional()
  sort?: string;
}

