import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum VendorCreditNoteStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  APPLIED = 'applied',
  VOID = 'void',
}

export enum VendorCreditNoteReason {
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  DISCOUNT = 'discount',
  OTHER = 'other',
}

@Entity('vendor_credit_notes')
export class VendorCreditNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'credit_note_number' })
  creditNoteNumber: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_id' })
  vendorId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_name' })
  vendorName: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'bill_id' })
  billId: string | null;

  @Column({ type: 'date', name: 'credit_date' })
  creditDate: Date;

  @Column({
    type: 'enum',
    enum: VendorCreditNoteReason,
  })
  reason: VendorCreditNoteReason;

  @Column({
    type: 'enum',
    enum: VendorCreditNoteStatus,
    default: VendorCreditNoteStatus.DRAFT,
  })
  status: VendorCreditNoteStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'applied_amount' })
  appliedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany('VendorCreditNoteItem', 'vendorCreditNote', { cascade: true })
  items: any[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

