import { IsUUID, IsDateString, IsNumber, IsString, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ReviewStatus } from '../entities/performance-review.entity';

export class CreatePerformanceReviewDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  reviewerId: string;

  @IsUUID()
  @IsOptional()
  reviewCycleId?: string;

  @IsDateString()
  reviewDate: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;
}
