import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  total: number;
}

