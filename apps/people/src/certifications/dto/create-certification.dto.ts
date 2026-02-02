import { IsString, IsInt, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  name: string;

  @IsString()
  issuingOrganization: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  validityPeriodMonths?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @IsBoolean()
  @IsOptional()
  mandatory?: boolean;
}
