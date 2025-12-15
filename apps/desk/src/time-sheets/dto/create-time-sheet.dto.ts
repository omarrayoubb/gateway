import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class CreateTimeSheetDto {
  @IsString()
  @IsNotEmpty()
  serviceResource: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsUUID()
  @IsNotEmpty()
  serviceId: string;
}

