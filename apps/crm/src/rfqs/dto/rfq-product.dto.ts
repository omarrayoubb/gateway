import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RFQProductDto {
  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  quantity: number;

  @IsString()
  @IsOptional()
  discount?: string;
}

