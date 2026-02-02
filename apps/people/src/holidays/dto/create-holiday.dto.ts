import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateHolidayDto {
  @IsString()
  name: string;

  @IsDateString()
  date: string;

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;
}

