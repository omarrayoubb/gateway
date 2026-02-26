import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesOrderProduct } from './entities/sales-order-product.entity';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, SalesOrderProduct])],
  providers: [SalesOrdersService],
  controllers: [SalesOrdersController],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}

