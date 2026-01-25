import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attendance_policy')
export class AttendancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'time', name: 'expected_start_time' })
  expectedStartTime: string;

  @Column({ type: 'time', name: 'expected_end_time' })
  expectedEndTime: string;

  @Column({ type: 'int', default: 0, name: 'grace_period_minutes' })
  gracePeriodMinutes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'minimum_hours_for_full_day' })
  minimumHoursForFullDay: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'standard_work_hours' })
  standardWorkHours: number;

  @Column({ type: 'int', name: 'standard_work_days' })
  standardWorkDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'late_arrival_deduction_per_hour' })
  lateArrivalDeductionPerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'early_departure_deduction_per_hour' })
  earlyDepartureDeductionPerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'absent_day_deduction' })
  absentDayDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'half_day_deduction' })
  halfDayDeduction: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0, name: 'overtime_multiplier' })
  overtimeMultiplier: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

