import { IsString, IsInt, IsArray, IsEnum, IsOptional, Min } from 'class-validator';
import { DifficultyLevel } from '../entities/career-path.entity';

export class CareerPathMilestoneDto {
  @IsString()
  title: string;

  @IsInt()
  @Min(1)
  duration_months: number;
}

export class CreateCareerPathDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  startingRole?: string;

  @IsString()
  @IsOptional()
  targetRole?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDurationYears?: number;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsArray()
  @IsOptional()
  requiredSkills?: string[];

  @IsArray()
  @IsOptional()
  requiredCompetencies?: string[];

  @IsArray()
  @IsOptional()
  milestones?: CareerPathMilestoneDto[];
}
