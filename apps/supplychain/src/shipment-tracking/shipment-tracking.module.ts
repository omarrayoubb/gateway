import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentTrackingService } from './shipment-tracking.service';
import { ShipmentTrackingGrpcController } from './shipment-tracking.grpc.controller';
import { ShipmentTracking } from './entities/shipment-tracking.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentTracking, Shipment])],
  providers: [ShipmentTrackingService],
  controllers: [ShipmentTrackingGrpcController],
  exports: [ShipmentTrackingService],
})
export class ShipmentTrackingModule {}

