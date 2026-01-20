import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export enum AccruedExpenseStatus {
  ACCRUED = 'accrued',
  REVERSED = 'reversed',
  PAID = 'paid',
}

@Entity('accrued_expenses')
export class AccruedExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  accrualNumber: string | null;

  @Column({ type: 'varchar', length: 500 })
  expenseDescription: string;

  @Column({ type: 'date' })
  accrualDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  accountId: string | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'uuid', nullable: true })
  vendorId: string | null;

  @Column({
    type: 'enum',
    enum: AccruedExpenseStatus,
    default: AccruedExpenseStatus.ACCRUED,
  })
  status: AccruedExpenseStatus;

  @Column({ type: 'date', nullable: true })
  reversalDate: Date | null;

  @Column({ type: 'text', nullable: true })
  reversalReason: string | null;

  @Column({ type: 'uuid', nullable: true })
  journalEntryId: string | null;

  @Column({ type: 'uuid', nullable: true })
  reversalJournalEntryId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

