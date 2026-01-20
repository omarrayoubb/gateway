import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BudgetPeriod } from '../budget-periods/entities/budget-period.entity';

export enum PeriodType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum BudgetStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', name: 'budget_name' })
  budgetName: string;

  @Column({ type: 'integer', name: 'fiscal_year' })
  fiscalYear: number;

  @Column({
    type: 'enum',
    enum: PeriodType,
    name: 'period_type',
  })
  periodType: PeriodType;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'project_id' })
  projectId: string | null;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @Column({ type: 'varchar', nullable: true, name: 'account_code' })
  accountCode: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'account_name' })
  accountName: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'budget_amount' })
  budgetAmount: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status: BudgetStatus;

  @OneToMany(() => BudgetPeriod, (period) => period.budget, { cascade: true })
  periods: BudgetPeriod[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

