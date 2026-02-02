import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  LEAVE = 'leave',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'varchar', nullable: true, name: 'employee_email' })
  employeeEmail: string | null;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'check_in_time' })
  checkInTime: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'check_out_time' })
  checkOutTime: Date | null;

  @Column({ type: 'text', nullable: true, name: 'check_in_location' })
  checkInLocation: string | null;

  @Column({ type: 'text', nullable: true, name: 'check_out_location' })
  checkOutLocation: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'total_hours' })
  totalHours: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'overtime_hours' })
  overtimeHours: number | null;

  @Column({ type: 'boolean', default: false, name: 'is_late' })
  isLate: boolean;

  @Column({ type: 'int', default: 0, name: 'late_arrival_minutes' })
  lateArrivalMinutes: number;

  @Column({ type: 'int', default: 0, name: 'early_departure_minutes' })
  earlyDepartureMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'deduction_amount' })
  deductionAmount: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

