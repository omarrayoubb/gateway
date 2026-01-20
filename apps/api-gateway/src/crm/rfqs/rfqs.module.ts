import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RFQsService } from './rfqs.service';
import { RFQsController } from './rfqs.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['rfqs'],
          url: process.env.CRM_GRPC_URL || '0.0.0.0:50052',
          protoPath: join(process.cwd(), 'proto/crm/rfqs.proto'),
        },
      },
    ]),
  ],
  controllers: [RFQsController],
  providers: [RFQsService],
  exports: [RFQsService],
})
export class RFQsModule {}

