import { IsString, IsUUID, IsInt, IsDateString, IsBoolean, IsArray, IsEnum, IsOptional, Min } from 'class-validator';
import { OnboardingPlanStatus } from '../entities/onboarding-plan.entity';

export class OnboardingPhaseDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class ChecklistItemDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  required: boolean;
}

export class RequiredDocumentDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  required: boolean;
}

export class CreateOnboardingPlanDto {
  @IsString()
  name: string;

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
