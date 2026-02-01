import { IsUUID, IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { OnboardingTaskStatus } from '../entities/onboarding-task.entity';

export class CreateOnboardingTaskDto {
  @IsUUID()
  onboardingPlanId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(OnboardingTaskStatus)
  @IsOptional()
  status?: OnboardingTaskStatus;
}
