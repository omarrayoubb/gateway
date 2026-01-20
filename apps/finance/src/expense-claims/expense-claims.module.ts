import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseClaim } from './entities/expense-claim.entity';
import { ExpenseClaimExpense } from './entities/expense-claim-expense.entity';
import { ExpenseClaimsService } from './expense-claims.service';
import { ExpenseClaimsGrpcController } from './expense-claims.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseClaim, ExpenseClaimExpense]),
    OrganizationsModule,
    ExpensesModule,
  ],
  providers: [ExpenseClaimsService],
  controllers: [ExpenseClaimsGrpcController],
  exports: [ExpenseClaimsService],
})
export class ExpenseClaimsModule {}

