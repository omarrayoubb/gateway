import { IsUUID, IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { PayrollStatus } from '../entities/payroll-record.entity';

export class CreatePayrollRecordDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  payPeriod: string; // Format: YYYY-MM

  @IsNumber()
  grossPay: number;

  @IsNumber()
  deductions: number;

  @IsNumber()
  netPay: number;

  @IsEnum(PayrollStatus)
  @IsOptional()
  status?: PayrollStatus;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;
}
