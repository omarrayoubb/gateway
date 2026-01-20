import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoicePaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  customer_id?: string;

  @IsBoolean()
  @IsOptional()
  is_proforma?: boolean;
}

