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
          url: '0.0.0.0:50054',
          protoPath: join(__dirname, '../../../libs/common/src/proto/supplychain/supplychain.proto'),
        },
      },
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['contacts', 'accounts'],
          url: '0.0.0.0:50052',
          protoPath: [
            join(__dirname, '../../../libs/common/src/proto/crm/contacts.proto'),
            join(__dirname, '../../../libs/common/src/proto/crm/accounts.proto'),
          ],
        },
      },
    ]),
  ],
  controllers: [SupplyChainController],
  providers: [SupplyChainService],
})
export class SupplyChainModule {}

