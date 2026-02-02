import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Approval } from './entities/approval.entity';
import { ApprovalHistory } from './entities/approval-history.entity';
import { Employee } from '../people/entities/person.entity';
import { ApprovalsService } from './approvals.service';
import { ApprovalsGrpcController } from './approvals.grpc.controller';
import { HierarchyModule } from '../hierarchy/hierarchy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Approval, ApprovalHistory, Employee]),
    HierarchyModule,
  ],
  providers: [ApprovalsService],
  controllers: [ApprovalsGrpcController],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
