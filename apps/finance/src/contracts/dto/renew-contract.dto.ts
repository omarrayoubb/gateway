import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RenewContractDto {
  @IsDateString()
  @IsNotEmpty()
  new_end_date: string;

  @IsString()
  @IsOptional()
  renewal_terms?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  updated_value?: number;
}

