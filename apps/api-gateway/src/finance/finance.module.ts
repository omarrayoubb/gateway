import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { ReportsController } from './reports.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FINANCE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'finance',
          url: process.env.FINANCE_GRPC_URL || 'finance:50055',
          protoPath: join(process.cwd(), 'proto/finance/finance.proto'),
        },
      },
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['contacts', 'accounts'],
          url: process.env.CRM_GRPC_URL || 'crm:50052',
          protoPath: [
            join(process.cwd(), 'proto/crm/contacts.proto'),
            join(process.cwd(), 'proto/crm/accounts.proto'),
          ],
        },
      },
      {
        name: 'SUPPLYCHAIN_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'supplychain',
          url: process.env.SUPPLYCHAIN_GRPC_URL || 'supplychain:50054',
          protoPath: join(process.cwd(), 'proto/supplychain/supplychain.proto'),
        },
      },
    ]),
  ],
  controllers: [FinanceController, ReportsController],
  providers: [FinanceService],
})
export class FinanceModule {}

