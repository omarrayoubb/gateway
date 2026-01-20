import { IsString, IsDateString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreditNoteStatus, CreditNoteReason } from '../entities/credit-note.entity';
import { CreateCreditNoteItemDto } from './create-credit-note-item.dto';

export class CreateCreditNoteDto {
  @IsString()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsOptional()
  credit_note_number?: string;

  @IsUUID()
  @IsNotEmpty()
  customer_id: string;

  @IsUUID()
  @IsOptional()
  invoice_id?: string;

  @IsDateString()
  @IsNotEmpty()
  credit_date: string;

  @IsEnum(CreditNoteReason)
  @IsNotEmpty()
  reason: CreditNoteReason;

  @IsNumber()
  @Min(0)
  @IsOptional()
  total_amount?: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCreditNoteItemDto)
  @IsOptional()
  items?: CreateCreditNoteItemDto[];

  @IsEnum(CreditNoteStatus)
  @IsOptional()
  status?: CreditNoteStatus;
}

