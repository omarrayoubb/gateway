import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PurchaseBillStatus } from '../entities/purchase-bill.entity';

export class PurchaseBillPaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(PurchaseBillStatus)
  status?: PurchaseBillStatus;

  @IsOptional()
  @IsString()
  vendor_id?: string;
}

