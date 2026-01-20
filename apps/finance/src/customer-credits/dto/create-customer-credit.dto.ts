import { IsUUID, IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { RiskLevel } from '../entities/customer-credit.entity';

export class CreateCustomerCreditDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  customer_id: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsNumber()
  @Min(0)
  credit_limit: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  current_balance?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  credit_score?: number;

  @IsEnum(RiskLevel)
  @IsOptional()
  risk_level?: RiskLevel;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  on_time_payment_rate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  average_days_to_pay?: number;
}

