import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BankAccount } from '../../bank-accounts/entities/bank-account.entity';

export enum BankReconciliationStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('bank_reconciliations')
export class BankReconciliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'uuid', name: 'bank_account_id' })
  bankAccountId: string;

  @ManyToOne(() => BankAccount, { nullable: true })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount | null;

  @Column({ type: 'varchar', nullable: true, name: 'bank_account_name' })
  bankAccountName: string | null;

  @Column({ type: 'date', name: 'reconciliation_date' })
  reconciliationDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'statement_balance' })
  statementBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'book_balance' })
  bookBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'adjusted_balance' })
  adjustedBalance: number;

  @Column({
    type: 'enum',
    enum: BankReconciliationStatus,
    default: BankReconciliationStatus.DRAFT,
  })
  status: BankReconciliationStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'outstanding_deposits' })
  outstandingDeposits: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'outstanding_checks' })
  outstandingChecks: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'bank_charges' })
  bankCharges: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'interest_earned' })
  interestEarned: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

