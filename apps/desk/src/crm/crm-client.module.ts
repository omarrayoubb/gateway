import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CrmClientService } from './crm-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'crm',
          url: '0.0.0.0:50052',
          protoPath: join(__dirname, '../../../libs/common/src/proto/crm.proto'),
        },
      },
    ]),
  ],
  providers: [CrmClientService],
  exports: [CrmClientService],
})
export class CrmClientModule {}

