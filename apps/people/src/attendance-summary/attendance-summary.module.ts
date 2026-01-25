import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSummary } from './entities/attendance-summary.entity';
import { AttendanceSummaryService } from './attendance-summary.service';
import { AttendanceSummaryGrpcController } from './attendance-summary.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceSummary]),
  ],
  providers: [AttendanceSummaryService],
  controllers: [AttendanceSummaryGrpcController],
  exports: [AttendanceSummaryService],
})
export class AttendanceSummaryModule {}

