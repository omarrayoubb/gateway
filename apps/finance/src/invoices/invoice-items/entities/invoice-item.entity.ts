import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'invoice_id' })
  invoiceId: string;

  @ManyToOne('Invoice', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: any;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'tax_rate' })
  taxRate: number | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, name: 'tax_amount' })
  taxAmount: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0, name: 'discount_percent' })
  discountPercent: number | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, name: 'discount_amount' })
  discountAmount: number | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

