import { IsString, IsUUID, IsOptional } from 'class-validator';

export class AssetDisposalPaginationDto {
  @IsUUID()
  @IsOptional()
  asset_id?: string;

  @IsString()
  @IsOptional()
  sort?: string;
}

