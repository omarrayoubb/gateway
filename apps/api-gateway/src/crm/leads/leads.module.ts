import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['leads'],
          url: '0.0.0.0:50052',
          // apps/api-gateway/src/crm/leads/leads.module.ts
          protoPath: join(__dirname, '../../../libs/common/src/proto/crm/leads.proto'),
        },
      },
    ]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
