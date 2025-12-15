import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

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
  controllers: [CrmController],
  providers: [CrmService],
})
export class CrmModule {}

