import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsGrpcController } from './departments.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
  ],
  providers: [DepartmentsService],
  controllers: [DepartmentsGrpcController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}

