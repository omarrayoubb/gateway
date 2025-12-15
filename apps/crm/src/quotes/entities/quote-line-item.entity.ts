import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quote } from './quote.entity';

@Entity('quote_line_items')
export class QuoteLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'quote_id' })
  quoteId: string;

  @ManyToOne(() => Quote, (quote) => quote.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quote_id' })
  quote: Quote;

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

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;
}

