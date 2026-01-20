import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum CreditNoteStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  APPLIED = 'applied',
  VOID = 'void',
}

export enum CreditNoteReason {
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  DISCOUNT = 'discount',
  OTHER = 'other',
}

@Entity('credit_notes')
export class CreditNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'credit_note_number' })
  creditNoteNumber: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'customer_id' })
  customerId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'customer_name' })
  customerName: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'invoice_id' })
  invoiceId: string | null;

  @Column({ type: 'date', name: 'credit_date' })
  creditDate: Date;

  @Column({
    type: 'enum',
    enum: CreditNoteReason,
  })
  reason: CreditNoteReason;

  @Column({
    type: 'enum',
    enum: CreditNoteStatus,
    default: CreditNoteStatus.DRAFT,
  })
  status: CreditNoteStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'applied_amount' })
  appliedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany('CreditNoteItem', 'creditNote', { cascade: true })
  items: any[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

