import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum SendMethod {
  EMAIL = 'email',
  PRINT = 'print',
  BOTH = 'both',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'invoice_number' })
  invoiceNumber: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'proforma_number' })
  proformaNumber: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_proforma' })
  isProforma: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'customer_account_id' })
  customerAccountId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'customer_account_name' })
  customerAccountName: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'customer_name' })
  customerName: string | null;

  @Column({ type: 'date', name: 'invoice_date' })
  invoiceDate: Date;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

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

  @Column({ type: 'timestamp', nullable: true, name: 'sent_at' })
  sentAt: Date | null;

  @Column({ type: 'varchar', nullable: true, name: 'sent_by' })
  sentBy: string | null;

  @OneToMany('InvoiceItem', 'invoice', { cascade: true })
  items: any[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

