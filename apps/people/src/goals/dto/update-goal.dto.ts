import { IsString, IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { GoalStatus, AlignmentLevel } from '../entities/goal.entity';

export class UpdateGoalDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

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

  @IsUUID()
  @IsOptional()
  parentGoalId?: string;

  @IsEnum(AlignmentLevel)
  @IsOptional()
  alignmentLevel?: AlignmentLevel;
}
