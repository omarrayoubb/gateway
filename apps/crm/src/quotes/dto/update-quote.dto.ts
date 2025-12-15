import { IsString, IsOptional, IsUUID, IsArray, IsNumber, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteLineItemDto } from './quote-line-item.dto';

export class UpdateQuoteDto {
  @IsString()
  @IsOptional()
  quoteName?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  contactId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  @IsOptional()
  lineItems?: QuoteLineItemDto[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  approvalStatus?: string;

  @IsUUID()
  @IsOptional()
  rfqId?: string;

  @IsString()
  @IsOptional()
  rfqType?: string;

  @IsNumber()
  @IsOptional()
  taxPercentage?: number;

  @IsString()
  @IsOptional()
  deliveryTerms?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  customerNotes?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}

