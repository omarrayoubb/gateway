import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AssetType, AssetStatus } from '../entities/asset.entity';

export class AssetPaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsEnum(AssetType)
  @IsOptional()
  asset_type?: AssetType;
}

