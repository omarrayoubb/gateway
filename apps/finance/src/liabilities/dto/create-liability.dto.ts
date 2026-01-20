import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Min,
  Length,
} from 'class-validator';
import { LiabilityType } from '../entities/liability.entity';

export class CreateLiabilityDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  liability_code: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  liability_name: string;

  @IsEnum(LiabilityType)
  @IsNotEmpty()
  liability_type: LiabilityType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  interest_rate?: number;

  @IsUUID()
  @IsNotEmpty()
  account_id: string;
}

