import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum OnboardingPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface OnboardingPhase {
  name: string;
  description: string;
}

export interface ChecklistItem {
  title: string;
  description: string;
  required: boolean;
}

export interface RequiredDocument {
  name: string;
  description: string;
  required: boolean;
}

@Entity('onboarding_plans')
export class OnboardingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'uuid', nullable: true, name: 'employee_id' })
  employeeId: string | null;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: Date | null;

  @Column({ type: 'int', nullable: true, name: 'duration_days' })
  durationDays: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true, name: 'welcome_message' })
  welcomeMessage: string | null;

  @Column({ type: 'boolean', default: false, name: 'assign_buddy' })
  assignBuddy: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'buddy_id' })
  buddyId: string | null;

  @Column({ type: 'boolean', default: false, name: 'require_initial_goals' })
  requireInitialGoals: boolean;

  @Column({ type: 'jsonb', nullable: true })
  phases: OnboardingPhase[] | null;

  @Column({ type: 'jsonb', nullable: true, name: 'checklist_template' })
  checklistTemplate: ChecklistItem[] | null;

  @Column({ type: 'jsonb', nullable: true, name: 'required_documents' })
  requiredDocuments: RequiredDocument[] | null;

  @Column({
    type: 'enum',
    enum: OnboardingPlanStatus,
    default: OnboardingPlanStatus.DRAFT,
  })
  status: OnboardingPlanStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
