import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseApproval } from './entities/expense-approval.entity';
import { ExpenseApprovalsService } from './expense-approvals.service';
import { ExpenseApprovalsGrpcController } from './expense-approvals.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseApproval]),
    OrganizationsModule,
  ],
  providers: [ExpenseApprovalsService],
  controllers: [ExpenseApprovalsGrpcController],
  exports: [ExpenseApprovalsService],
})
export class ExpenseApprovalsModule {}

