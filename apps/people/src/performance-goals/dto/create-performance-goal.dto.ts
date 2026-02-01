import { IsUUID, IsString, IsDateString, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { GoalStatus } from '../entities/performance-goal.entity';

export class CreatePerformanceGoalDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
