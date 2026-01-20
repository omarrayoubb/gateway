import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ExpenseClaimExpense } from './expense-claim-expense.entity';

export enum ExpenseClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

@Entity('expense_claims')
export class ExpenseClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'claim_number' })
  claimNumber: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'employee_id' })
  employeeId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'employee_name' })
  employeeName: string | null;

  @Column({ type: 'date', name: 'claim_date' })
  claimDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ExpenseClaimStatus,
    default: ExpenseClaimStatus.DRAFT,
  })
  status: ExpenseClaimStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'approved_by' })
  approvedBy: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'rejected_by' })
  rejectedBy: string | null;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @OneToMany(() => ExpenseClaimExpense, (expense) => expense.expenseClaim, { cascade: true })
  expenses: ExpenseClaimExpense[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

