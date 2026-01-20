import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ExpenseClaim } from './expense-claim.entity';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('expense_claim_expenses')
export class ExpenseClaimExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'expense_claim_id' })
  expenseClaimId: string;

  @ManyToOne(() => ExpenseClaim, (claim) => claim.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_claim_id' })
  expenseClaim: ExpenseClaim;

  @Column({ type: 'uuid', name: 'expense_id' })
  expenseId: string;

  @ManyToOne(() => Expense, { nullable: true })
  @JoinColumn({ name: 'expense_id' })
  expense: Expense | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}

