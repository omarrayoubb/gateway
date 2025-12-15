import { IsUUID, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEstimateServiceDto {
  @IsUUID()
  @IsNotEmpty()
  estimateId: string;

  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

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

