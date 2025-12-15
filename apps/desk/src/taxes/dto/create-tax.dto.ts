import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  percentage: number;
}

