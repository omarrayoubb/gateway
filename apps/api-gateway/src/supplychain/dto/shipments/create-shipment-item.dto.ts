import { IsString, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateShipmentItemDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  @IsOptional()
  batch_id?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

