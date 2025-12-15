import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  netPrice: number;
}

