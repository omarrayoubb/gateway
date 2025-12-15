import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DESK_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['workOrders'],
          url: '0.0.0.0:50053',
          protoPath: join(__dirname, '../../../libs/common/src/proto/desk/work-orders.proto'),
        },
      },
    ]),
  ],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}

