import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceGrpcController } from './attendance.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
  ],
  providers: [AttendanceService],
  controllers: [AttendanceGrpcController],
  exports: [AttendanceService],
})
export class AttendanceModule {}

