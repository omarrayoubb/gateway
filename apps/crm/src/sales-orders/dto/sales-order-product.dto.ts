import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SalesOrderProductDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  listPrice: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  amount: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  tax?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  total: number;
}

