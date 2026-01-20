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

export enum LiabilityType {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term',
}

export enum LiabilityStatus {
  ACTIVE = 'active',
  PAID = 'paid',
  DEFAULTED = 'defaulted',
}

@Entity('liabilities')
export class Liability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  liabilityCode: string;

  @Column({ type: 'varchar', length: 255 })
  liabilityName: string;

  @Column({
    type: 'enum',
    enum: LiabilityType,
  })
  liabilityType: LiabilityType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number;

  @Column({
    type: 'enum',
    enum: LiabilityStatus,
    default: LiabilityStatus.ACTIVE,
  })
  status: LiabilityStatus;

  @Column({ type: 'uuid', nullable: true })
  accountId: string | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

