import { IsString, IsNumber, IsInt, IsOptional, IsObject } from 'class-validator';

export class CreatePayrollConfigurationDto {
  @IsString()
  name: string;

  @IsString()
  payFrequency: string;

  @IsInt()
  payDay: number;

  @IsNumber()
  taxRate: number;

  @IsObject()
  @IsOptional()
  deductionRules?: Record<string, any>;
}
