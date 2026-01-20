import { IsString, IsNumber, IsDateString, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class CalculateTaxDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  tax_code: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

