import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum PayrollExceptionStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
}

@Entity('payroll_exceptions')
export class PayrollException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'varchar', length: 7, name: 'pay_period' })
  payPeriod: string; // Format: YYYY-MM

  @Column({ type: 'varchar', length: 100, name: 'exception_type' })
  exceptionType: string; // e.g., 'missing_attendance', 'overtime', etc.

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number | null;

  @Column({
    type: 'enum',
    enum: PayrollExceptionStatus,
    default: PayrollExceptionStatus.PENDING,
  })
  status: PayrollExceptionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
