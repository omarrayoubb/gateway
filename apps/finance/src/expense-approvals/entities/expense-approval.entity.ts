import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('expense_approvals')
export class ExpenseApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'expense_id' })
  expenseId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'expense_claim_id' })
  expenseClaimId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'approver_id' })
  approverId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'approver_name' })
  approverName: string | null;

  @Column({ type: 'int', default: 1, name: 'approval_level' })
  approvalLevel: number;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_date' })
  approvedDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

