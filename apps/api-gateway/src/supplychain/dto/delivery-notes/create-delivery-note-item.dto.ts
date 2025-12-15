import { IsString, IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateDeliveryNoteItemDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  @IsOptional()
  batch_id?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

