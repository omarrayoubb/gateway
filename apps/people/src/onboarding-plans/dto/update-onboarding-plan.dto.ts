import { IsString, IsUUID, IsInt, IsDateString, IsBoolean, IsArray, IsEnum, IsOptional, Min } from 'class-validator';
import { OnboardingPlanStatus } from '../entities/onboarding-plan.entity';
import { OnboardingPhaseDto, ChecklistItemDto, RequiredDocumentDto } from './create-onboarding-plan.dto';

export class UpdateOnboardingPlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationDays?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  welcomeMessage?: string;

  @IsBoolean()
  @IsOptional()
  assignBuddy?: boolean;

  @IsUUID()
  @IsOptional()
  buddyId?: string;

  @IsBoolean()
  @IsOptional()
  requireInitialGoals?: boolean;

  @IsArray()
  @IsOptional()
  phases?: OnboardingPhaseDto[];

  @IsArray()
  @IsOptional()
  checklistTemplate?: ChecklistItemDto[];

  @IsArray()
  @IsOptional()
  requiredDocuments?: RequiredDocumentDto[];

  @IsEnum(OnboardingPlanStatus)
  @IsOptional()
  status?: OnboardingPlanStatus;
}
