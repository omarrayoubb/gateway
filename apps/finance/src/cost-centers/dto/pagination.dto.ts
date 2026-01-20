import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export class CostCenterPaginationDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;
}

