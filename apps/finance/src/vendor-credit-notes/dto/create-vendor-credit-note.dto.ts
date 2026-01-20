import { IsString, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorCreditNoteStatus, VendorCreditNoteReason } from '../entities/vendor-credit-note.entity';

export class CreateVendorCreditNoteItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unit_price?: number;

  @IsNumber()
  @IsOptional()
  amount?: number;
}

export class CreateVendorCreditNoteDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsOptional()
  credit_note_number?: string;

  @IsString()
  vendor_id: string;

  @IsUUID()
  @IsOptional()
  bill_id?: string;

  @IsDateString()
  credit_date: string;

  @IsEnum(VendorCreditNoteReason)
  reason: VendorCreditNoteReason;

  @IsEnum(VendorCreditNoteStatus)
  @IsOptional()
  status?: VendorCreditNoteStatus;

  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVendorCreditNoteItemDto)
  items: CreateVendorCreditNoteItemDto[];
}

