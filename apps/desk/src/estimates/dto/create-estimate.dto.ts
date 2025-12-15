import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsObject,
  IsUUID,
} from 'class-validator';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';

export class CreateEstimateDto {
  @IsString()
  summary: string;

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

  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @IsUUID()
  @IsOptional()
  parentWorkOrderId?: string;

  @IsUUID()
  @IsOptional()
  requestId?: string;

  @IsString()
  createdBy: string;
}

