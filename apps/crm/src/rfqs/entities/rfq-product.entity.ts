import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RFQ } from './rfq.entity';

@Entity('rfq_products')
export class RFQProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'rfq_id' })
  rfqId: string;

  @ManyToOne(() => RFQ, (rfq) => rfq.rfqProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfq_id' })
  rfq: RFQ;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string; // Reference to supplychain product (not FK)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  discount: string | null; // Discount reason

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

