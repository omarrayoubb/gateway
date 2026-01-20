import { IsEnum, IsArray, IsString, IsOptional } from 'class-validator';
import { SendMethod } from '../entities/invoice.entity';

export class SendInvoiceDto {
  @IsEnum(SendMethod)
  @IsOptional()
  send_method?: SendMethod;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  email_to?: string[];

  @IsString()
  @IsOptional()
  email_subject?: string;

  @IsString()
  @IsOptional()
  email_message?: string;
}

