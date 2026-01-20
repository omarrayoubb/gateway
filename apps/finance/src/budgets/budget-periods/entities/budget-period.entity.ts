import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Budget } from '../../entities/budget.entity';

@Entity('budget_periods')
export class BudgetPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'budget_id' })
  budgetId: string;

  @ManyToOne(() => Budget, (budget) => budget.periods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budget_id' })
  budget: Budget;

  @Column({ type: 'varchar', name: 'period' })
  period: string; // Format: "2024-01" for monthly, "2024-Q1" for quarterly, "2024" for annually

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

