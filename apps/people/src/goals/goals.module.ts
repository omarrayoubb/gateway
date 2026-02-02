import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { GoalsService } from './goals.service';
import { GoalsGrpcController } from './goals.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal]),
  ],
  providers: [GoalsService],
  controllers: [GoalsGrpcController],
  exports: [GoalsService],
})
export class GoalsModule {}
