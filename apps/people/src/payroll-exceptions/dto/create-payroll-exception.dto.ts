import { IsUUID, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { PayrollExceptionStatus } from '../entities/payroll-exception.entity';

export class CreatePayrollExceptionDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  payPeriod: string; // Format: YYYY-MM

  @IsString()
  exceptionType: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(PayrollExceptionStatus)
  @IsOptional()
  status?: PayrollExceptionStatus;
}
