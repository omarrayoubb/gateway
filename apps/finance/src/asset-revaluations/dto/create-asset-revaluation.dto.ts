import { IsString, IsDateString, IsUUID, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAssetRevaluationDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsUUID()
  @IsNotEmpty()
  asset_id: string;

  @IsDateString()
  @IsNotEmpty()
  revaluation_date: string;

  @IsNumber()
  @IsOptional()
  new_value?: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsUUID()
  @IsNotEmpty()
  account_id: string;
}

