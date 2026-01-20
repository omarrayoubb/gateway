import { IsOptional, IsString, IsEnum } from 'class-validator';
import { LiabilityType } from '../entities/liability.entity';

export class LiabilityPaginationDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(LiabilityType)
  liability_type?: LiabilityType;
}

