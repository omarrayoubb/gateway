import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * A DTO for validating pagination query parameters.
 */
export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform query param string to number
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100) // Don't allow fetching more than 100 at a time
  @Type(() => Number) // Transform query param string to number
  limit: number = 10;
}