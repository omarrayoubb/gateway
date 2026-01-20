import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RecurringBillCategory {
  ELECTRICITY = 'electricity',
  WATER = 'water',
  INTERNET = 'internet',
  PHONE = 'phone',
  RENT = 'rent',
  INSURANCE = 'insurance',
}

export enum RecurringBillFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

@Entity('recurring_bills')
export class RecurringBill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', name: 'bill_name' })
  billName: string;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_id' })
  vendorId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_name' })
  vendorName: string | null;

  @Column({
    type: 'enum',
    enum: RecurringBillCategory,
    nullable: true,
  })
  category: RecurringBillCategory | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: RecurringBillFrequency,
  })
  frequency: RecurringBillFrequency;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'next_due_date' })
  nextDueDate: Date | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'auto_create' })
  autoCreate: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'account_id' })
  accountId: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

