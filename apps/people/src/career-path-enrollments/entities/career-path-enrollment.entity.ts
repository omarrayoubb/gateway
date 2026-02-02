import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum CareerPathEnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

@Entity('career_path_enrollments')
export class CareerPathEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'career_path_id' })
  careerPathId: string;

  @Column({ type: 'date', name: 'enrollment_date' })
  enrollmentDate: Date;

  @Column({ type: 'int', default: 0, name: 'current_milestone' })
  currentMilestone: number;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({
    type: 'enum',
    enum: CareerPathEnrollmentStatus,
    default: CareerPathEnrollmentStatus.ACTIVE,
  })
  status: CareerPathEnrollmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
