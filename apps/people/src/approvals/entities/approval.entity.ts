import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RequestType {
  LEAVE = 'leave',
  ATTENDANCE_REGULARIZATION = 'attendance_regularization',
  WFH = 'wfh',
  SHIFT_CHANGE = 'shift_change',
  PROFILE_UPDATE = 'profile_update',
  CUSTOM = 'custom',
}

export enum ApprovalStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RequestType,
    name: 'request_type',
  })
  requestType: RequestType;

  @Column({ type: 'uuid', name: 'request_id' })
  requestId: string;

  @Column({ type: 'uuid', name: 'requester_id' })
  requesterId: string;

  @Column({ type: 'uuid', nullable: true, name: 'current_approver_id' })
  currentApproverId: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'approval_chain' })
  approvalChain: string[] | null;

  @Column({ type: 'int', default: 0, name: 'current_level' })
  currentLevel: number;

  @Column({ type: 'int', default: 1, name: 'total_levels' })
  totalLevels: number;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.DRAFT,
  })
  status: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'escalated_to' })
  escalatedTo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'rejected_at' })
  rejectedAt: Date | null;
}
