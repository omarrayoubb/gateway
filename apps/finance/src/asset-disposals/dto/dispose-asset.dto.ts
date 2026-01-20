import { IsString, IsDateString, IsUUID, IsNumber, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { DisposalMethod } from '../entities/asset-disposal.entity';

export class DisposeAssetDto {
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

