import { IsOptional, IsString, IsEnum, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorProductStatus } from '../entities/vendor-product.entity';

export class VendorProductPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsEnum(VendorProductStatus)
  status?: VendorProductStatus;

  @IsOptional()
  @IsString()
  sort?: string;
}

