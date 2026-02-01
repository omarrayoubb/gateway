import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum PayrollStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  PAID = 'paid',
}

@Entity('payroll_records')
export class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'varchar', length: 7, name: 'pay_period' })
  payPeriod: string; // Format: YYYY-MM

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'gross_pay' })
  grossPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'net_pay' })
  netPay: number;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.PENDING,
  })
  status: PayrollStatus;

  @Column({ type: 'date', nullable: true, name: 'payment_date' })
  paymentDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
