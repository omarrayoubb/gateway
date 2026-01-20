import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsGrpcController } from './reports.grpc.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { BudgetPeriod } from '../budgets/budget-periods/entities/budget-period.entity';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Budget, BudgetPeriod, GeneralLedger]),
  ],
  providers: [ReportsService],
  controllers: [ReportsGrpcController],
  exports: [ReportsService],
})
export class ReportsModule {}

