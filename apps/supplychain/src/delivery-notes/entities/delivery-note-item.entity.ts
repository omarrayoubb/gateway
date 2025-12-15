import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeliveryNote } from './delivery-note.entity';
import { Product } from '../../products/entities/product.entity';
import { InventoryBatch } from '../../inventory-batches/entities/inventory-batch.entity';

@Entity('delivery_note_items')
export class DeliveryNoteItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'delivery_note_id' })
  deliveryNoteId: string;

  @ManyToOne(() => DeliveryNote, (deliveryNote) => deliveryNote.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_note_id' })
  deliveryNote: DeliveryNote;

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

