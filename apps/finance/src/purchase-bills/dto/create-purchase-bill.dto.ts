import { IsString, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseBillStatus } from '../entities/purchase-bill.entity';

export class CreatePurchaseBillItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unit_price?: number;

  @IsUUID()
  @IsOptional()
  account_id?: string;
}

export class CreatePurchaseBillDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsOptional()
  bill_number?: string;

  @IsString()
  vendor_id: string;

  @IsDateString()
  bill_date: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsEnum(PurchaseBillStatus)
  @IsOptional()
  status?: PurchaseBillStatus;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  tax_rate?: number;

  @IsString()
  @IsOptional()
  attachment_url?: string;

  @IsString()
  @IsOptional()
  attachment_name?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseBillItemDto)
  items: CreatePurchaseBillItemDto[];
}

