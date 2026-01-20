import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { CreateAssetDto } from './create-asset.dto';
import { AssetStatus } from '../entities/asset.entity';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @IsNumber()
  @IsOptional()
  current_value?: number;

  @IsNumber()
  @IsOptional()
  accumulated_depreciation?: number;

  @IsNumber()
  @IsOptional()
  net_book_value?: number;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;
}

