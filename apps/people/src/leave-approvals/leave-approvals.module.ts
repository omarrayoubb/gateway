import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveApproval } from './entities/leave-approval.entity';
import { LeaveApprovalsService } from './leave-approvals.service';
import { LeaveApprovalsGrpcController } from './leave-approvals.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveApproval]),
  ],
  providers: [LeaveApprovalsService],
  controllers: [LeaveApprovalsGrpcController],
  exports: [LeaveApprovalsService],
})
export class LeaveApprovalsModule {}

