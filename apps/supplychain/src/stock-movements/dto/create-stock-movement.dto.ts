import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsDateString,
  Min,
} from 'class-validator';
import { MovementType, ReferenceType } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsUUID()
  @IsOptional()
  batch_id?: string;

  @IsUUID()
  @IsNotEmpty()
  warehouse_id: string;

  @IsEnum(MovementType)
  @IsNotEmpty()
  movement_type: MovementType;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @IsEnum(ReferenceType)
  @IsOptional()
  reference_type?: ReferenceType;

  @IsUUID()
  @IsOptional()
  reference_id?: string;

  @IsDateString()
  @IsOptional()
  movement_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  user_id?: string;
}

