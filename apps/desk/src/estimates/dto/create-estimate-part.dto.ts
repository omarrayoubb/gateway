import { IsUUID, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEstimatePartDto {
  @IsUUID()
  @IsNotEmpty()
  estimateId: string;

  @IsUUID()
  @IsNotEmpty()
  partId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsUUID()
  @IsOptional()
  taxId?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

