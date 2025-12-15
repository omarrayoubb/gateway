import { IsString, IsEnum, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderStatus } from '../entities/purchase-order.entity';
import { CreatePurchaseOrderItemDto } from './create-purchase-order-item.dto';

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  poNumber: string;

  @IsUUID()
  vendorId: string;

  @IsUUID()
  warehouseId: string;

  @IsDateString()
  orderDate: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

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
  totalAmount: number;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

