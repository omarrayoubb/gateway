import { IsString, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeliveryNoteItemDto } from './create-delivery-note-item.dto';

export class CreateDeliveryNoteDto {
  @IsString()
  @IsOptional()
  dn_number?: string;

  @IsString()
  @IsNotEmpty()
  delivered_to: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  tax_card?: string;

  @IsString()
  @IsOptional()
  cr?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryNoteItemDto)
  items: CreateDeliveryNoteItemDto[];
}

