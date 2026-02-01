import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum CycleStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PLANNED = 'planned',
  CANCELLED = 'cancelled',
}

@Entity('review_cycles')
export class ReviewCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: CycleStatus,
    default: CycleStatus.PLANNED,
  })
  status: CycleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
