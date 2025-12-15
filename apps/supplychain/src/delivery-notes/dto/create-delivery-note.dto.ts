import { IsString, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeliveryNoteItemDto } from './create-delivery-note-item.dto';

export class CreateDeliveryNoteDto {
  @IsString()
  @IsOptional()
  dnNumber?: string;

  @IsString()
  @IsNotEmpty()
  deliveredTo: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  taxCard?: string;

  @IsString()
  @IsOptional()
  cr?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryNoteItemDto)
  items: CreateDeliveryNoteItemDto[];
}

