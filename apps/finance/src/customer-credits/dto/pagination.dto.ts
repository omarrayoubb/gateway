import { IsOptional, IsString, IsEnum } from 'class-validator';
import { RiskLevel } from '../entities/customer-credit.entity';

export class CustomerCreditPaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @IsEnum(RiskLevel)
  @IsOptional()
  risk_level?: RiskLevel;
}

