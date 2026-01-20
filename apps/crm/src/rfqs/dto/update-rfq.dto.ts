import {
  IsString,
  IsUUID,
  IsArray,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RFQProductDto } from './rfq-product.dto';

export enum RFQCurrency {
  USD = 'USD',
  AED = 'AED',
  EGP = 'EGP',
}

export enum RFQStatus {
  SUBMITTED = 'submitted',
  COMPLETED = 'completed',
}

export class UpdateRFQDto {
  @IsString()
  @IsOptional()
  rfqName?: string;

  @IsString()
  @IsOptional()
  rfqNumber?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  contactId?: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @IsEnum(RFQCurrency)
  @IsOptional()
  currency?: RFQCurrency;

  @IsEnum(RFQStatus)
  @IsOptional()
  status?: RFQStatus;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RFQProductDto)
  @IsOptional()
  rfqProducts?: RFQProductDto[];
}

