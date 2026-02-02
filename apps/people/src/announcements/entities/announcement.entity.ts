import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum TargetAudience {
  ALL = 'all',
  DEPARTMENT = 'department',
  SPECIFIC = 'specific',
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId: string;

  @Column({
    type: 'enum',
    enum: TargetAudience,
    default: TargetAudience.ALL,
    name: 'target_audience',
  })
  targetAudience: TargetAudience;

  @Column({ type: 'jsonb', nullable: true, name: 'target_departments' })
  targetDepartments: string[] | null; // Array of department IDs

  @Column({
    type: 'enum',
    enum: AnnouncementPriority,
    default: AnnouncementPriority.NORMAL,
  })
  priority: AnnouncementPriority;

  @Column({
    type: 'enum',
    enum: AnnouncementStatus,
    default: AnnouncementStatus.DRAFT,
  })
  status: AnnouncementStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
