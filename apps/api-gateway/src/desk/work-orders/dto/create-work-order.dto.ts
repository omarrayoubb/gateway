import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsObject,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { TicketPriority } from '@app/common/enums/ticket-priority.enum';
import { BillingStatus } from '@app/common/enums/billing-status.enum';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  agent?: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

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

  @IsEnum(BillingStatus)
  @IsOptional()
  billingStatus?: BillingStatus;

  @IsUUID()
  @IsOptional()
  installationBaseId?: string;

  @IsUUID()
  @IsOptional()
  parentWorkOrderId?: string;

  @IsUUID()
  @IsOptional()
  requestId?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

