import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentScheduleStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export enum PaymentScheduleMethod {
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentSchedulePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('payment_schedules')
export class PaymentSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_id' })
  vendorId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_name' })
  vendorName: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'bill_id' })
  billId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'bill_number' })
  billNumber: string | null;

  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'amount_due' })
  amountDue: number;

  @Column({
    type: 'enum',
    enum: PaymentScheduleStatus,
    default: PaymentScheduleStatus.PENDING,
  })
  status: PaymentScheduleStatus;

  @Column({
    type: 'enum',
    enum: PaymentScheduleMethod,
    nullable: true,
    name: 'payment_method',
  })
  paymentMethod: PaymentScheduleMethod | null;

  @Column({ type: 'date', nullable: true, name: 'scheduled_payment_date' })
  scheduledPaymentDate: Date | null;

  @Column({
    type: 'enum',
    enum: PaymentSchedulePriority,
    nullable: true,
    default: PaymentSchedulePriority.MEDIUM,
  })
  priority: PaymentSchedulePriority | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

