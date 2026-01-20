import { PartialType } from '@nestjs/mapped-types';
import { CreateLiabilityDto } from './create-liability.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { LiabilityStatus } from '../entities/liability.entity';

export class UpdateLiabilityDto extends PartialType(CreateLiabilityDto) {
  @IsEnum(LiabilityStatus)
  @IsOptional()
  status?: LiabilityStatus;
}

