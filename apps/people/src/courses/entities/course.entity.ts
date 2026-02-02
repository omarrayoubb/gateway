import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DeliveryMode {
  ONLINE = 'Online',
  IN_PERSON = 'In Person',
  HYBRID = 'Hybrid',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instructor: string | null;

  @Column({ type: 'int', nullable: true, name: 'duration_hours' })
  durationHours: number | null;

  @Column({
    type: 'enum',
    enum: DeliveryMode,
    nullable: true,
    name: 'delivery_mode',
  })
  deliveryMode: DeliveryMode | null;

  @Column({ type: 'int', nullable: true, name: 'max_participants' })
  maxParticipants: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'cost_per_participant' })
  costPerParticipant: number | null;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date | null;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
