import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('payroll_configurations')
export class PayrollConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, name: 'pay_frequency' })
  payFrequency: string; // e.g., 'monthly', 'biweekly', 'weekly'

  @Column({ type: 'int', name: 'pay_day' })
  payDay: number; // Day of month (1-31)

  @Column({ type: 'decimal', precision: 5, scale: 4, name: 'tax_rate' })
  taxRate: number; // e.g., 0.2 for 20%

  @Column({ type: 'jsonb', nullable: true, name: 'deduction_rules' })
  deductionRules: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
