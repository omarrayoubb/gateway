import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum ApplicantStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

@Entity('applicants')
export class Applicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'job_posting_id' })
  jobPostingId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'resume_url' })
  resumeUrl: string | null;

  @Column({ type: 'text', nullable: true, name: 'cover_letter' })
  coverLetter: string | null;

  @Column({
    type: 'enum',
    enum: ApplicantStatus,
    default: ApplicantStatus.APPLIED,
  })
  status: ApplicantStatus;

  @Column({ type: 'date', name: 'applied_date' })
  appliedDate: Date;

  @Column({ type: 'date', nullable: true, name: 'interview_date' })
  interviewDate: Date | null;

  @Column({ type: 'text', nullable: true, name: 'interview_notes' })
  interviewNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
