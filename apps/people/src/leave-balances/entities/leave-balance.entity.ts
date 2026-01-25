import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leave_balances')
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'leave_type' })
  leaveType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  used: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  accrued: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'carried_forward' })
  carriedForward: number;

  @Column({ type: 'int' })
  year: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

