import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingPlan } from './entities/onboarding-plan.entity';
import { OnboardingPlansService } from './onboarding-plans.service';
import { OnboardingPlansGrpcController } from './onboarding-plans.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnboardingPlan]),
  ],
  providers: [OnboardingPlansService],
  controllers: [OnboardingPlansGrpcController],
  exports: [OnboardingPlansService],
})
export class OnboardingPlansModule {}
