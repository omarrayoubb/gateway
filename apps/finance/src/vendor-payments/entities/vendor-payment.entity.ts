import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum VendorPaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  OTHER = 'other',
}

export enum VendorPaymentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled',
}

@Entity('vendor_payments')
export class VendorPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'payment_number' })
  paymentNumber: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_id' })
  vendorId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_name' })
  vendorName: string | null;

  @Column({ type: 'date', name: 'payment_date' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: VendorPaymentMethod,
  })
  paymentMethod: VendorPaymentMethod;

  @Column({ type: 'varchar', nullable: true, name: 'payment_reference' })
  paymentReference: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: VendorPaymentStatus,
    default: VendorPaymentStatus.PENDING,
  })
  status: VendorPaymentStatus;

  @Column({ type: 'uuid', nullable: true, name: 'bank_account_id' })
  bankAccountId: string | null;

  @OneToMany('VendorPaymentAllocation', 'vendorPayment', { cascade: true })
  allocations: any[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

