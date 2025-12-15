import { IsUUID, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWorkOrderPartDto {
  @IsUUID()
  @IsNotEmpty()
  workOrderId: string;

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

