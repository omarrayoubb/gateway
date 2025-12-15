import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { WarehousesService } from './warehouses.service';
import { WarehousesGrpcController } from './warehouses.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse]),
  ],
  providers: [WarehousesService],
  controllers: [WarehousesGrpcController],
  exports: [WarehousesService],
})
export class WarehousesModule {}

