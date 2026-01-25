import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePolicy } from './entities/attendance-policy.entity';
import { AttendancePolicyService } from './attendance-policy.service';
import { AttendancePolicyGrpcController } from './attendance-policy.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendancePolicy]),
  ],
  providers: [AttendancePolicyService],
  controllers: [AttendancePolicyGrpcController],
  exports: [AttendancePolicyService],
})
export class AttendancePolicyModule {}

