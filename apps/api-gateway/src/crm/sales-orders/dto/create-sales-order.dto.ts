import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SalesOrderProductDto } from './sales-order-product.dto';

export enum SalesOrderStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class CreateSalesOrderDto {
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  customerNo?: string;

  @IsString()
  @IsOptional()
  pending?: string;

  @IsString()
  @IsOptional()
  carrier?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  salesCommission?: number;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsUUID()
  @IsOptional()
  contactId?: string | null;

  @IsUUID()
  @IsOptional()
  dealId?: string | null;

  @IsUUID()
  @IsOptional()
  rfqId?: string | null;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  exchangeRate?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  exciseDuty?: number;

  @IsEnum(SalesOrderStatus)
  @IsOptional()
  status?: SalesOrderStatus;

  @IsString()
  @IsOptional()
  billingStreet?: string;

  @IsString()
  @IsOptional()
  billingCity?: string;

  @IsString()
  @IsOptional()
  billingState?: string;

  @IsString()
  @IsOptional()
  billingCode?: string;

  @IsString()
  @IsOptional()
  billingCountry?: string;

  @IsString()
  @IsOptional()
  shippingStreet?: string;

  @IsString()
  @IsOptional()
  shippingCity?: string;

  @IsString()
  @IsOptional()
  shippingState?: string;

  @IsString()
  @IsOptional()
  shippingCode?: string;

  @IsString()
  @IsOptional()
  shippingCountry?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  total?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  adjustment?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  grandtotal?: number;

  @IsString()
  @IsOptional()
  termsandcondition?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderProductDto)
  @IsOptional()
  products?: SalesOrderProductDto[];
}

