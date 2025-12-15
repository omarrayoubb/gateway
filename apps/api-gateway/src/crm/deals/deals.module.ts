import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['deals'],
          url: '0.0.0.0:50052',
          protoPath: join(__dirname, '../../../libs/common/src/proto/crm/deals.proto'),
        },
      },
    ]),
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}

