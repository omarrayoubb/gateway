import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CashAccountPaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

