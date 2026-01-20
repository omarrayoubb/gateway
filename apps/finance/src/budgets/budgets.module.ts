import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsService } from './budgets.service';
import { BudgetsGrpcController } from './budgets.grpc.controller';
import { Budget } from './entities/budget.entity';
import { BudgetPeriod } from './budget-periods/entities/budget-period.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, BudgetPeriod]),
    OrganizationsModule,
    AccountsModule,
  ],
  providers: [BudgetsService],
  controllers: [BudgetsGrpcController],
  exports: [BudgetsService],
})
export class BudgetsModule {}

