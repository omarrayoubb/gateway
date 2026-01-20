import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ClosePeriodDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

