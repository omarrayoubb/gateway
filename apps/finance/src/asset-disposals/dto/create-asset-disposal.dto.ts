import { IsString, IsDateString, IsUUID, IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { DisposalMethod } from '../entities/asset-disposal.entity';

export class CreateAssetDisposalDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  @IsNotEmpty()
  asset_id: string;

  @IsDateString()
  @IsNotEmpty()
  disposal_date: string;

  @IsEnum(DisposalMethod)
  @IsNotEmpty()
  disposal_method: DisposalMethod;

  @IsNumber()
  @IsOptional()
  disposal_amount?: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsUUID()
  @IsNotEmpty()
  account_id: string;
}

