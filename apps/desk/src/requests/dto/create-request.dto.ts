import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsObject,
} from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';

export class CreateRequestDto {
  @IsString()
  summary: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  currency: string;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsString()
  company: string;

  @IsString()
  contact: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsObject()
  @IsOptional()
  serviceAddress?: Record<string, any>;

  @IsObject()
  @IsOptional()
  billingAddress?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  preferredDate1?: string;

  @IsDateString()
  @IsOptional()
  preferredDate2?: string;

  @IsString()
  @IsOptional()
  preferredTime?: string;

  @IsString()
  @IsOptional()
  preferredNotes?: string;

  @IsString()
  @IsOptional()
  territory?: string;

  @IsString()
  @IsOptional()
  ticketId?: string;

  @IsString()
  createdBy: string;
}

