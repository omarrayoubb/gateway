import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsEnum,
  IsOptional,
  ValidateNested,
  ValidateIf,
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

export class CreateRFQDto {
  @IsString()
  @IsNotEmpty()
  rfqName: string;

  @IsString()
  @IsOptional()
  rfqNumber?: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.leadId)
  contactId?: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.contactId)
  leadId?: string;

  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @IsEnum(RFQCurrency)
  @IsNotEmpty()
  currency: RFQCurrency;

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

