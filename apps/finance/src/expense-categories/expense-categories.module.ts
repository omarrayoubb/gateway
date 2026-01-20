import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategoriesGrpcController } from './expense-categories.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseCategory]),
    OrganizationsModule,
    AccountsModule,
  ],
  providers: [ExpenseCategoriesService],
  controllers: [ExpenseCategoriesGrpcController],
  exports: [ExpenseCategoriesService],
})
export class ExpenseCategoriesModule {}

