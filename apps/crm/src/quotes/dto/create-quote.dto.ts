import { IsString, IsNotEmpty, IsUUID, IsArray, IsOptional, IsNumber, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteLineItemDto } from './quote-line-item.dto';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  quoteName: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsUUID()
  @IsNotEmpty()
  contactId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineItemDto)
  lineItems: QuoteLineItemDto[];

  @IsString()
  @IsNotEmpty()
  currency: string;

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
}

