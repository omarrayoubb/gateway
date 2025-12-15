import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateDeliveryNoteItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  batchId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

