import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { PaymentScheduleStatus } from '../entities/payment-schedule.entity';

export class PaymentSchedulePaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(PaymentScheduleStatus)
  status?: PaymentScheduleStatus;

  @IsOptional()
  @IsString()
  vendor_id?: string;

  @IsOptional()
  @IsDateString()
  due_date_from?: string;

  @IsOptional()
  @IsDateString()
  due_date_to?: string;
}

