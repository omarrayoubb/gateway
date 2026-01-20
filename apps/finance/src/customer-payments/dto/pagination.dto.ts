import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { PaymentStatus } from '../entities/customer-payment.entity';

export class CustomerPaymentPaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}

