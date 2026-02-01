import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum OnboardingTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('onboarding_tasks')
export class OnboardingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'onboarding_plan_id' })
  onboardingPlanId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'assigned_to' })
  assignedTo: string | null;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({
    type: 'enum',
    enum: OnboardingTaskStatus,
    default: OnboardingTaskStatus.PENDING,
  })
  status: OnboardingTaskStatus;

  @Column({ type: 'date', nullable: true, name: 'completed_date' })
  completedDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
