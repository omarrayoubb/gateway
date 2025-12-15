import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string;

  // Either leadId OR contactId must be provided (mutually exclusive)
  // Validation will be done in service
  @IsUUID()
  @IsOptional()
  leadId?: string | null;

  @IsUUID()
  @IsOptional()
  contactId?: string | null;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  closingDate?: Date;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  probability?: number;

  @IsString()
  @IsOptional()
  leadSource?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  boxFolderId?: string;

  @IsString()
  @IsOptional()
  campaignSource?: string;

  @IsString()
  @IsOptional()
  quote?: string;
}

