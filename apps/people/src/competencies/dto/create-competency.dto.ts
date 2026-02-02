import { IsString, IsArray, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CompetencyLevelDto {
  @IsOptional()
  level?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCompetencyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompetencyLevelDto)
  levels?: CompetencyLevelDto[];
}
