import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AlignmentLevel {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  DEPARTMENT = 'department',
  ORGANIZATION = 'organization',
}

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'date', nullable: true, name: 'target_date' })
  targetDate: Date | null;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.ACTIVE,
  })
  status: GoalStatus;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'uuid', nullable: true, name: 'parent_goal_id' })
  parentGoalId: string | null;

  @Column({
    type: 'enum',
    enum: AlignmentLevel,
    default: AlignmentLevel.INDIVIDUAL,
    name: 'alignment_level',
  })
  alignmentLevel: AlignmentLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
