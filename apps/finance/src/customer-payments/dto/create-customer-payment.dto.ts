import { IsString, IsDateString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../entities/customer-payment.entity';
import { CreatePaymentAllocationDto } from './create-payment-allocation.dto';

export class CreateCustomerPaymentDto {
  @IsString()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsOptional()
  payment_number?: string;

  @IsUUID()
  @IsNotEmpty()
  customer_id: string;

  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

  @IsString()
  @IsOptional()
  payment_reference?: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUUID()
  @IsOptional()
  bank_account_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentAllocationDto)
  @IsOptional()
  allocations?: CreatePaymentAllocationDto[];

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}

