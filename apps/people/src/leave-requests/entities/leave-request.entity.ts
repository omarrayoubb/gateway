import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'employee_id' })
  employeeId: string | null;

  @Column({ type: 'uuid', name: 'leave_type' })
  leaveType: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'int', name: 'number_of_days' })
  numberOfDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'number_of_hours' })
  numberOfHours: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'hours_from' })
  hoursFrom: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'hours_to' })
  hoursTo: string | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: LeaveRequestStatus,
    default: LeaveRequestStatus.PENDING,
  })
  status: LeaveRequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

