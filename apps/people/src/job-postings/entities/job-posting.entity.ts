import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum JobPostingStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'department_id' })
  departmentId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  requirements: string[] | null; // Array of requirement strings

  @Column({
    type: 'enum',
    enum: JobPostingStatus,
    default: JobPostingStatus.DRAFT,
  })
  status: JobPostingStatus;

  @Column({ type: 'date', nullable: true, name: 'posted_date' })
  postedDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'closing_date' })
  closingDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
