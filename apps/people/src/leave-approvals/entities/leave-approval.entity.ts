import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum LeaveApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('leave_approvals')
export class LeaveApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'leave_request_id' })
  leaveRequestId: string;

  @Column({ type: 'uuid', name: 'approver_id' })
  approverId: string;

  @Column({
    type: 'enum',
    enum: LeaveApprovalStatus,
    default: LeaveApprovalStatus.PENDING,
  })
  status: LeaveApprovalStatus;

  @Column({ type: 'int', name: 'approval_level' })
  approvalLevel: number;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_date' })
  approvedDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'rejected_date' })
  rejectedDate: Date | null;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

