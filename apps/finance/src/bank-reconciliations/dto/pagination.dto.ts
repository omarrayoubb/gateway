import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { BankReconciliationStatus } from '../entities/bank-reconciliation.entity';

export class BankReconciliationPaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsUUID()
  bank_account_id?: string;

  @IsOptional()
  @IsEnum(BankReconciliationStatus)
  status?: BankReconciliationStatus;
}

