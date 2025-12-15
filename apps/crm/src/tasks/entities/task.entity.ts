import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  NOT_STARTED = 'not started',
  DEFERRED = 'deferred',
  IN_PROGRESS = 'in progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true, name: 'task_number' })
  taskNumber: string;

  @Column({ type: 'uuid', name: 'owner_id', nullable: true })
  ownerId: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User | null;

  @Column()
  subject: string;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  links: string[];

  @Column({
    type: 'varchar',
    nullable: true,
  })
  priority: TaskPriority | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  status: TaskStatus | null;



  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'exchange_rate' })
  exchangeRate: number;

  @Column({ type: 'timestamp', nullable: true, name: 'closed_time' })
  closedTime: Date | null;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'modified_by' })
  modifiedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
