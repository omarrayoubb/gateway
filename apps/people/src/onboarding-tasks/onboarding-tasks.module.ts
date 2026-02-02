import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingTask } from './entities/onboarding-task.entity';
import { OnboardingTasksService } from './onboarding-tasks.service';
import { OnboardingTasksGrpcController } from './onboarding-tasks.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnboardingTask]),
  ],
  providers: [OnboardingTasksService],
  controllers: [OnboardingTasksGrpcController],
  exports: [OnboardingTasksService],
})
export class OnboardingTasksModule {}
