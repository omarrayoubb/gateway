import { IsString, IsDateString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../entities/invoice.entity';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @IsString()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsOptional()
  invoice_number?: string;

  @IsString()
  @IsOptional()
  proforma_number?: string;

  @IsBoolean()
  @IsOptional()
  is_proforma?: boolean;

  @IsString()
  @IsNotEmpty()
  customer_account_name: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsString()
  @IsOptional()
  customer_account_id?: string;

  @IsDateString()
  @IsNotEmpty()
  invoice_date: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax_rate?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @IsOptional()
  items?: CreateInvoiceItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

