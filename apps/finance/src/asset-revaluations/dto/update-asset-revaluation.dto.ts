import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsEnum, IsString } from 'class-validator';
import { CreateAssetRevaluationDto } from './create-asset-revaluation.dto';
import { RevaluationType, RevaluationStatus } from '../entities/asset-revaluation.entity';

export class UpdateAssetRevaluationDto extends PartialType(CreateAssetRevaluationDto) {
  @IsNumber()
  @IsOptional()
  revaluation_amount?: number;

  @IsEnum(RevaluationType)
  @IsOptional()
  revaluation_type?: RevaluationType;

  @IsEnum(RevaluationStatus)
  @IsOptional()
  status?: RevaluationStatus;
}

