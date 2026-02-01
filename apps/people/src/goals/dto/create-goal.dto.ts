import { IsUUID, IsString, IsDateString, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { GoalStatus, AlignmentLevel } from '../entities/goal.entity';

export class CreateGoalDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  title: string;

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
