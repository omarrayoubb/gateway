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
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum BatchStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
}

@Entity('inventory_batches')
export class InventoryBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'varchar', name: 'batch_number' })
  batchNumber: string;

  @Column({ type: 'varchar', nullable: true })
  barcode: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'quantity_available' })
  quantityAvailable: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'unit_cost' })
  unitCost: number;

  @Column({ type: 'date', nullable: true, name: 'manufacturing_date' })
  manufacturingDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'expiry_date' })
  expiryDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'received_date' })
  receivedDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.AVAILABLE,
  })
  status: BatchStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

