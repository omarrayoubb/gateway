import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('leave_accruals')
export class LeaveAccrual {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'leave_type' })
  leaveType: string;

  @Column({ type: 'date', name: 'accrual_date' })
  accrualDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'days_accrued' })
  daysAccrued: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

