import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryNotesService } from './delivery-notes.service';
import { DeliveryNotesGrpcController } from './delivery-notes.grpc.controller';
import { DeliveryNote } from './entities/delivery-note.entity';
import { DeliveryNoteItem } from './entities/delivery-note-item.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch } from '../inventory-batches/entities/inventory-batch.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryNote, DeliveryNoteItem, Product, InventoryBatch, StockMovement])],
  providers: [DeliveryNotesService],
  controllers: [DeliveryNotesGrpcController],
  exports: [DeliveryNotesService],
})
export class DeliveryNotesModule {}

