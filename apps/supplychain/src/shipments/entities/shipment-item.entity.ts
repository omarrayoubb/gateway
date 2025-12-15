import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';
import { Product } from '../../products/entities/product.entity';
import { InventoryBatch } from '../../inventory-batches/entities/inventory-batch.entity';

@Entity('shipment_items')
export class ShipmentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', nullable: true, name: 'batch_id' })
  batchId: string | null;

  @ManyToOne(() => InventoryBatch, { nullable: true })
  @JoinColumn({ name: 'batch_id' })
  batch: InventoryBatch | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

