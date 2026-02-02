import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateHolidayDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;
}

