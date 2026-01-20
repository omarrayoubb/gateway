import { IsDateString, IsOptional } from 'class-validator';

export class ActivateContractDto {
  @IsDateString()
  @IsOptional()
  activation_date?: string;
}

