import { IsString, IsNotEmpty, IsUUID, IsArray, IsOptional, IsNumber, IsIn, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { RFQLineItemDto } from './rfq-line-item.dto';

export class CreateRFQDto {
  @IsString()
  @IsNotEmpty()
  rfqName: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  // Either contactId OR leadId must be provided (not both)
  @IsUUID()
  @ValidateIf((o) => !o.leadId)
  @IsNotEmpty({ message: 'Either contactId or leadId must be provided' })
  contactId?: string;

  @IsUUID()
  @ValidateIf((o) => !o.contactId)
  @IsNotEmpty({ message: 'Either contactId or leadId must be provided' })
  leadId?: string;

  @IsString()
  @IsOptional()
  vendors?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RFQLineItemDto)
  lineItems: RFQLineItemDto[];

  @IsString()
  @IsNotEmpty()
  @IsIn(['EGP', 'USD', 'AED'], { message: 'Currency must be EGP, USD, or AED' })
  currency: string;

  @IsString()
  @IsNotEmpty()
  rfqNumber: string; // Quotation Code - user provided

  @IsString()
  @IsOptional()
  @IsIn(['COMPLETED', 'SUBMITTED'], { message: 'Status must be COMPLETED or SUBMITTED' })
  status?: string;

  @IsUUID()
  @IsOptional()
  manufacturerId?: string;

  @IsUUID()
  @IsOptional()
  productLineId?: string;

  @IsNumber()
  @IsOptional()
  taxPercentage?: number;

  @IsString()
  @IsOptional()
  deliveryTerms?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  additionalNotes?: string;
}

