import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TicketStatus } from 'libs/common/src/enums/ticket-status.enum';
import { TicketPriority } from 'libs/common/src/enums/ticket-priority.enum';
import { TicketClassification } from 'libs/common/src/enums/ticket-classification.enum';

export class CreateTicketDto {
  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  accountName?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsEnum(TicketClassification)
  @IsOptional()
  classification?: TicketClassification;

  @IsString()
  @IsOptional()
  ticketOwner?: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  vendor: string;

  @IsString()
  serialNumber: string;

  @IsDateString()
  @IsOptional()
  dateTime1?: string;

  @IsString()
  @IsOptional()
  channel?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

