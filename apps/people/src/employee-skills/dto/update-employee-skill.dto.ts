import { IsEnum, IsBoolean, IsUUID, IsDateString, IsOptional } from 'class-validator';
import { ProficiencyLevel } from '../entities/employee-skill.entity';

export class UpdateEmployeeSkillDto {
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
