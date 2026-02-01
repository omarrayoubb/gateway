import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequestsGrpcController } from './leave-requests.grpc.controller';
import { ApprovalsModule } from '../approvals/approvals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest]),
    ApprovalsModule,
  ],
  providers: [LeaveRequestsService],
  controllers: [LeaveRequestsGrpcController],
  exports: [LeaveRequestsService],
})
export class LeaveRequestsModule {}

