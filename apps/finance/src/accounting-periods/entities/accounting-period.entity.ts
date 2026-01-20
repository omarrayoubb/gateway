import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PeriodType {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum PeriodStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  LOCKED = 'locked',
}

@Entity('accounting_periods')
export class AccountingPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', name: 'period_name' })
  periodName: string;

  @Column({
    type: 'enum',
    enum: PeriodType,
    name: 'period_type',
  })
  periodType: PeriodType;

  @Column({ type: 'date', name: 'period_start' })
  periodStart: Date;

  @Column({ type: 'date', name: 'period_end' })
  periodEnd: Date;

  @Column({
    type: 'enum',
    enum: PeriodStatus,
    default: PeriodStatus.OPEN,
  })
  status: PeriodStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'closed_date' })
  closedDate: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'closed_by' })
  closedBy: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

