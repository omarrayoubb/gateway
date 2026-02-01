import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewCycle } from './entities/review-cycle.entity';
import { ReviewCyclesService } from './review-cycles.service';
import { ReviewCyclesGrpcController } from './review-cycles.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewCycle]),
  ],
  providers: [ReviewCyclesService],
  controllers: [ReviewCyclesGrpcController],
  exports: [ReviewCyclesService],
})
export class ReviewCyclesModule {}
