import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum PurchaseBillStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('purchase_bills')
export class PurchaseBill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'bill_number' })
  billNumber: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_id' })
  vendorId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_name' })
  vendorName: string | null;

  @Column({ type: 'date', name: 'bill_date' })
  billDate: Date;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({
    type: 'enum',
    enum: PurchaseBillStatus,
    default: PurchaseBillStatus.DRAFT,
  })
  status: PurchaseBillStatus;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'tax_amount' })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'paid_amount' })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'balance_due' })
  balanceDue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'tax_rate' })
  taxRate: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true, name: 'attachment_url' })
  attachmentUrl: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'attachment_name' })
  attachmentName: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'approved_by' })
  approvedBy: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column({ type: 'varchar', nullable: true, name: 'journal_entry_id' })
  journalEntryId: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'posted_at' })
  postedAt: Date | null;

  @OneToMany('PurchaseBillItem', 'purchaseBill', { cascade: true })
  items: any[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

