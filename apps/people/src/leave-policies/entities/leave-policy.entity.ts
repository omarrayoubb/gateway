import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('leave_policies')
export class LeavePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true, name: 'max_carry_forward_days' })
  maxCarryForwardDays: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'accrual_rate' })
  accrualRate: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

