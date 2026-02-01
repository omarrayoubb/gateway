import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { CycleStatus } from '../entities/review-cycle.entity';

export class CreateReviewCycleDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(CycleStatus)
  @IsOptional()
  status?: CycleStatus;
}
