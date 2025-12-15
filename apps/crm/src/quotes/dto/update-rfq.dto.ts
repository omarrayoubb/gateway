import { IsString, IsOptional, IsUUID, IsArray, IsNumber, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RFQLineItemDto } from './rfq-line-item.dto';

export class UpdateRFQDto {
  @IsString()
  @IsOptional()
  rfqName?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  contactId?: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  vendors?: string;

  @IsString()
  @IsOptional()
  rfqNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RFQLineItemDto)
  @IsOptional()
  lineItems?: RFQLineItemDto[];

  @IsString()
  @IsOptional()
  @IsIn(['COMPLETED', 'SUBMITTED'], { message: 'Status must be COMPLETED or SUBMITTED' })
  status?: string;

  @IsString()
  @IsOptional()
  approvalStatus?: string;

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
  specialRequirements?: string;

  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @IsString()
  @IsOptional()
  @IsIn(['EGP', 'USD', 'AED'], { message: 'Currency must be EGP, USD, or AED' })
  currency?: string;
}

