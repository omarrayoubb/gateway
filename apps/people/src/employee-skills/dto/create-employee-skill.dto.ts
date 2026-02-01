import { IsUUID, IsEnum, IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ProficiencyLevel } from '../entities/employee-skill.entity';

export class CreateEmployeeSkillDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  skillId: string;

  @IsEnum(ProficiencyLevel)
  @IsOptional()
  proficiencyLevel?: ProficiencyLevel;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsUUID()
  @IsOptional()
  verifiedBy?: string;

  @IsDateString()
  @IsOptional()
  verifiedDate?: string;
}
