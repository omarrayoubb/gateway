import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  IsEmail,
  Min,
} from 'class-validator';
import { WarehouseStatus } from '../entities/warehouse.entity';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;

  @IsBoolean()
  @IsOptional()
  temperature_controlled?: boolean;

  @IsNumber()
  @IsOptional()
  min_temperature?: number;

  @IsNumber()
  @IsOptional()
  max_temperature?: number;

  @IsString()
  @IsOptional()
  contact_phone?: string;

  @IsEmail()
  @IsOptional()
  contact_email?: string;
}

