import { IsString, IsArray, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { DifficultyLevel } from '../entities/learning-path.entity';

export class CreateLearningPathDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;

  @IsArray()
  @IsOptional()
  courses?: string[];

  @IsBoolean()
  @IsOptional()
  mandatory?: boolean;
}
