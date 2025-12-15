import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateShipmentItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  batchId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

