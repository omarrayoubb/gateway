import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('customer_credits')
export class CustomerCredit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'customer_id' })
  customerId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'customer_name' })
  customerName: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'credit_limit' })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'current_balance' })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'available_credit' })
  availableCredit: number;

  @Column({ type: 'integer', default: 0, name: 'credit_score' })
  creditScore: number;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM,
    name: 'risk_level',
  })
  riskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'on_time_payment_rate' })
  onTimePaymentRate: number;

  @Column({ type: 'integer', default: 0, name: 'average_days_to_pay' })
  averageDaysToPay: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

