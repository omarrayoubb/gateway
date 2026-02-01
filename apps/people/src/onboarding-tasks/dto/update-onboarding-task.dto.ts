import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { OnboardingTaskStatus } from '../entities/onboarding-task.entity';

export class UpdateOnboardingTaskDto {
  @IsEnum(OnboardingTaskStatus)
  @IsOptional()
  status?: OnboardingTaskStatus;

  @IsDateString()
  @IsOptional()
  completedDate?: string;
}
