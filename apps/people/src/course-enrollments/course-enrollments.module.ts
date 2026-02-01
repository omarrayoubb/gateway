import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CourseEnrollmentsGrpcController } from './course-enrollments.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEnrollment]),
  ],
  providers: [CourseEnrollmentsService],
  controllers: [CourseEnrollmentsGrpcController],
  exports: [CourseEnrollmentsService],
})
export class CourseEnrollmentsModule {}
