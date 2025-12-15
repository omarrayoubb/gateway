import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RFQ } from './rfq.entity';

@Entity('rfq_line_items')
export class RFQLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'rfq_id' })
  rfqId: string;

  @ManyToOne(() => RFQ, (rfq) => rfq.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rfq_id' })
  rfq: RFQ;

  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  productId: string;

  @Column({ name: 'product_name', nullable: true })
  productName: string;

  @Column({ name: 'product_code', nullable: true })
  productCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'list_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  listPrice: number;

  @Column({ name: 'requested_discount_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  requestedDiscountPercent: number;

  @Column({ name: 'requested_discount_reason', nullable: true })
  requestedDiscountReason: string;

  @Column({ name: 'approved_discount_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  approvedDiscountPercent: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total: number;

  @Column({ type: 'uuid', name: 'product_line_id', nullable: true })
  productLineId: string;

  @Column({ type: 'uuid', name: 'manufacturer_id', nullable: true })
  manufacturerId: string;
}

