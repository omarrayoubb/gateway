import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrderService } from './entities/work-order-service.entity';
import { WorkOrderPart } from './entities/work-order-part.entity';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, WorkOrderService, WorkOrderPart])],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService, TypeOrmModule],
})
export class WorkOrdersModule {}

