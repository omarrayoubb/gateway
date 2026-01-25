import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SummaryStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('attendance_summary')
export class AttendanceSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'varchar', length: 7 }) // Format: YYYY-MM
  month: string;

  @Column({ type: 'int', default: 0, name: 'days_present' })
  daysPresent: number;

  @Column({ type: 'int', default: 0, name: 'days_absent' })
  daysAbsent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_hours' })
  totalHours: number;

  @Column({ type: 'int', default: 0, name: 'late_arrivals_count' })
  lateArrivalsCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'overtime_hours' })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_deductions' })
  totalDeductions: number;

  @Column({
    type: 'enum',
    enum: SummaryStatus,
    default: SummaryStatus.PENDING,
  })
  status: SummaryStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

