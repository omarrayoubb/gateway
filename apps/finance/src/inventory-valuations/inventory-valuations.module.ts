import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryValuation } from './entities/inventory-valuation.entity';
import { InventoryValuationsService } from './inventory-valuations.service';
import { InventoryValuationsGrpcController } from './inventory-valuations.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryValuation]),
    OrganizationsModule,
  ],
  providers: [InventoryValuationsService],
  controllers: [InventoryValuationsGrpcController],
  exports: [InventoryValuationsService],
})
export class InventoryValuationsModule {}

