import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TerminateContractDto {
  @IsDateString()
  @IsNotEmpty()
  termination_date: string;

  @IsString()
  @IsNotEmpty()
  termination_reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

