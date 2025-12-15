import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateMaintenanceContractDto } from './create-maintenance-contract.dto';

export class UpdateMaintenanceContractDto extends PartialType(
  CreateMaintenanceContractDto,
) {
  @IsDateString()
  @IsOptional()
  next_scheduled_visit?: string;

  @IsNumber()
  @IsOptional()
  visits_completed?: number;

  @IsNumber()
  @IsOptional()
  visits_remaining?: number;

  @IsString()
  @IsOptional()
  status?: string;
}

