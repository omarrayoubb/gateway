import { IsUUID, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWorkOrderServiceDto {
  @IsUUID()
  @IsNotEmpty()
  workOrderId: string;

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

