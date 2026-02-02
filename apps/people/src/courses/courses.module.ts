import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesService } from './courses.service';
import { CoursesGrpcController } from './courses.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
  ],
  providers: [CoursesService],
  controllers: [CoursesGrpcController],
  exports: [CoursesService],
})
export class CoursesModule {}
