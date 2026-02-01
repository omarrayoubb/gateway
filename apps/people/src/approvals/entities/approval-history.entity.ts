import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Approval } from './approval.entity';

export enum ApprovalAction {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  ESCALATED = 'escalated',
}

@Entity('approval_history')
export class ApprovalHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'approval_id' })
  approvalId: string;

  @ManyToOne(() => Approval)
  @JoinColumn({ name: 'approval_id' })
  approval: Approval;

  @Column({ type: 'uuid', name: 'approver_id' })
  approverId: string;

  @Column({
    type: 'enum',
    enum: ApprovalAction,
  })
  action: ApprovalAction;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
