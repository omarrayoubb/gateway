import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrderService } from './entities/work-order-service.entity';
import { WorkOrderPart } from './entities/work-order-part.entity';
import { WorkOrdersGrpcController } from './work-orders.grpc.controller';
import { WorkOrdersService } from './work-orders.service';
import { CrmClientModule } from '../crm/crm-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrder, WorkOrderService, WorkOrderPart]),
    CrmClientModule,
  ],
  controllers: [WorkOrdersGrpcController],
  providers: [WorkOrdersService],
  exports: [TypeOrmModule, WorkOrdersService],
})
export class WorkOrdersModule {}

