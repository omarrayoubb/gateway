import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { PerformanceGoalsService } from './performance-goals.service';
import { PerformanceGoalsGrpcController } from './performance-goals.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceGoal]),
  ],
  providers: [PerformanceGoalsService],
  controllers: [PerformanceGoalsGrpcController],
  exports: [PerformanceGoalsService],
})
export class PerformanceGoalsModule {}
