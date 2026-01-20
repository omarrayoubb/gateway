import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  ALLOCATED = 'allocated',
  UNALLOCATED = 'unallocated',
}

@Entity('customer_payments')
export class CustomerPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'payment_number' })
  paymentNumber: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'customer_id' })
  customerId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'customer_name' })
  customerName: string | null;

  @Column({ type: 'date', name: 'payment_date' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', nullable: true, name: 'payment_reference' })
  paymentReference: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'allocated_amount' })
  allocatedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'unallocated_amount' })
  unallocatedAmount: number;

  @Column({ type: 'uuid', nullable: true, name: 'bank_account_id' })
  bankAccountId: string | null;

  @OneToMany('CustomerPaymentAllocation', 'customerPayment', { cascade: true })
  allocations: any[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

