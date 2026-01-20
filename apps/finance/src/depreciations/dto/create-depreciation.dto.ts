import { IsString, IsDateString, IsUUID, IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { DepreciationStatus } from '../entities/depreciation.entity';

export class CreateDepreciationDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  @IsNotEmpty()
  asset_id: string;

  @IsDateString()
  @IsNotEmpty()
  depreciation_date: string;

  @IsString()
  @IsNotEmpty()
  period: string; // Format: YYYY-MM

  @IsNumber()
  @IsOptional()
  depreciation_amount?: number;

  @IsNumber()
  @IsOptional()
  accumulated_depreciation?: number;

  @IsNumber()
  @IsOptional()
  net_book_value?: number;

  @IsEnum(DepreciationStatus)
  @IsOptional()
  status?: DepreciationStatus;
}

