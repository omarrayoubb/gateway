import { IsUUID, IsInt, IsDateString, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateCompetencyAssessmentDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  competencyId: string;

  @IsUUID()
  assessedBy: string;

  @IsInt()
  @Min(1)
  @Max(4)
  level: number;

  @IsDateString()
  assessmentDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
