import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerPathEnrollment } from './entities/career-path-enrollment.entity';
import { CareerPathEnrollmentsService } from './career-path-enrollments.service';
import { CareerPathEnrollmentsGrpcController } from './career-path-enrollments.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareerPathEnrollment]),
  ],
  providers: [CareerPathEnrollmentsService],
  controllers: [CareerPathEnrollmentsGrpcController],
  exports: [CareerPathEnrollmentsService],
})
export class CareerPathEnrollmentsModule {}
