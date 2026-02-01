import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ComponentType } from '../entities/custom-payroll-component.entity';

export class CreateCustomPayrollComponentDto {
  @IsString()
  name: string;

  @IsEnum(ComponentType)
  type: ComponentType;

  @IsNumber()
  amount: number;

  @IsString()
  appliesTo: string;
}
