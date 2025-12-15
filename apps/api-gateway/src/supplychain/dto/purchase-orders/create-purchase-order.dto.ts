import { IsString, IsEnum, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePurchaseOrderItemDto } from './create-purchase-order-item.dto';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  po_number: string;

  @IsUUID()
  vendor_id: string;

  @IsUUID()
  warehouse_id: string;

  @IsDateString()
  order_date: string;

  @IsDateString()
  @IsOptional()
  expected_delivery_date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  tax: number;

  @IsNumber()
  @Min(0)
  total_amount: number;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

