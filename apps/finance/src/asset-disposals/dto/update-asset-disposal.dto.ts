import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { CreateAssetDisposalDto } from './create-asset-disposal.dto';
import { DisposalStatus } from '../entities/asset-disposal.entity';

export class UpdateAssetDisposalDto extends PartialType(CreateAssetDisposalDto) {
  @IsNumber()
  @IsOptional()
  gain_loss?: number;

  @IsEnum(DisposalStatus)
  @IsOptional()
  status?: DisposalStatus;
}

