import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { PaymentScheduleStatus, PaymentScheduleMethod, PaymentSchedulePriority } from '../entities/payment-schedule.entity';

export class CreatePaymentScheduleDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  vendor_id: string;

  @IsUUID()
  bill_id: string;

  @IsDateString()
  due_date: string;

  @IsNumber()
  @IsOptional()
  amount_due?: number;

  @IsEnum(PaymentScheduleMethod)
  @IsOptional()
  payment_method?: PaymentScheduleMethod;

  @IsDateString()
  @IsOptional()
  scheduled_payment_date?: string;

  @IsEnum(PaymentSchedulePriority)
  @IsOptional()
  priority?: PaymentSchedulePriority;
}

