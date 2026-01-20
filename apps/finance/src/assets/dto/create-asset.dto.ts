import { IsString, IsDateString, IsEnum, IsUUID, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { AssetType, DepreciationMethod } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  asset_code: string;

  @IsString()
  @IsNotEmpty()
  asset_name: string;

  @IsEnum(AssetType)
  @IsNotEmpty()
  asset_type: AssetType;

  @IsDateString()
  @IsNotEmpty()
  purchase_date: string;

  @IsNumber()
  @IsOptional()
  purchase_price?: number;

  @IsEnum(DepreciationMethod)
  @IsNotEmpty()
  depreciation_method: DepreciationMethod;

  @IsNumber()
  @IsOptional()
  useful_life_years?: number;

  @IsNumber()
  @IsOptional()
  salvage_value?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUUID()
  @IsNotEmpty()
  account_id: string;
}

