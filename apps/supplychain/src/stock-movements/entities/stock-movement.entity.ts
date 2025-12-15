import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { InventoryBatch } from '../../inventory-batches/entities/inventory-batch.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum MovementType {
  RECEIVE = 'receive',
  SHIP = 'ship',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export enum ReferenceType {
  INVENTORY_BATCH = 'InventoryBatch',
  ORDER = 'Order',
  TRANSFER = 'Transfer',
  ADJUSTMENT = 'Adjustment',
  DELIVERY_NOTE = 'DeliveryNote',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', name: 'batch_id', nullable: true })
  batchId: string | null;

  @ManyToOne(() => InventoryBatch, { nullable: true })
  @JoinColumn({ name: 'batch_id' })
  batch: InventoryBatch | null;

  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({
    type: 'enum',
    enum: MovementType,
    name: 'movement_type',
  })
  movementType: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: ReferenceType,
    nullable: true,
    name: 'reference_type',
  })
  referenceType: ReferenceType | null;

  @Column({ type: 'uuid', nullable: true, name: 'reference_id' })
  referenceId: string | null;

  @Column({ type: 'timestamp', name: 'movement_date' })
  movementDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

