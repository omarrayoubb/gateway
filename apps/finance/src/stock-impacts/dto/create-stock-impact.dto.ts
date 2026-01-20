import { IsString, IsDateString, IsEnum, IsUUID, IsNumber, IsOptional } from 'class-validator';
import { TransactionType } from '../entities/stock-impact.entity';

export class CreateStockImpactDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsDateString()
  transaction_date: string;

  @IsEnum(TransactionType)
  transaction_type: TransactionType;

  @IsUUID()
  item_id: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_cost: number;

  @IsNumber()
  @IsOptional()
  total_cost?: number;

  @IsUUID()
  @IsOptional()
  inventory_account_id?: string;

  @IsUUID()
  @IsOptional()
  cogs_account_id?: string;

  @IsUUID()
  @IsOptional()
  expense_account_id?: string;

  @IsUUID()
  @IsOptional()
  reference_id?: string;

  @IsString()
  @IsOptional()
  reference_type?: string;
}

