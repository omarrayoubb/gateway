import { IsUUID, IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { PayrollStatus } from '../entities/payroll-record.entity';

export class UpdatePayrollRecordDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  payPeriod?: string;

  @IsNumber()
  @IsOptional()
  grossPay?: number;

  @IsNumber()
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @IsOptional()
  netPay?: number;

  @IsEnum(PayrollStatus)
  @IsOptional()
  status?: PayrollStatus;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;
}
