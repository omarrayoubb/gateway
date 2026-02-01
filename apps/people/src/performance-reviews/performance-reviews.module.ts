import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { PerformanceReviewsService } from './performance-reviews.service';
import { PerformanceReviewsGrpcController } from './performance-reviews.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceReview]),
  ],
  providers: [PerformanceReviewsService],
  controllers: [PerformanceReviewsGrpcController],
  exports: [PerformanceReviewsService],
})
export class PerformanceReviewsModule {}
