import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashAccount } from './entities/cash-account.entity';
import { CashAccountsService } from './cash-accounts.service';
import { CashAccountsGrpcController } from './cash-accounts.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashAccount]),
    OrganizationsModule,
  ],
  providers: [CashAccountsService],
  controllers: [CashAccountsGrpcController],
  exports: [CashAccountsService],
})
export class CashAccountsModule {}

