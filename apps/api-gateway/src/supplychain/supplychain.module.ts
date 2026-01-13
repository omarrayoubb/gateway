import { Module } from '@nestjs/common';
import { SupplyChainService } from './supplychain.service';
import { SupplyChainController } from './supplychain.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SUPPLYCHAIN_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'supplychain',
          url: process.env.SUPPLYCHAIN_GRPC_URL || 'supplychain:50054',
          protoPath: join(process.cwd(), 'proto/supplychain/supplychain.proto'),
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
    ]),
  ],
  controllers: [SupplyChainController],
  providers: [SupplyChainService],
})
export class SupplyChainModule {}

