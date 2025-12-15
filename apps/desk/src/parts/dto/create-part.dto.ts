import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

