import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { LoanPayment } from './loan-payment.entity';

export enum LoanType {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term',
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum LoanStatus {
  ACTIVE = 'active',
  PAID_OFF = 'paid_off',
  DEFAULTED = 'defaulted',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  loanNumber: string;

  @Column({ type: 'varchar', length: 255 })
  loanName: string;

  @Column({ type: 'varchar', length: 255 })
  lender: string;

  @Column({
    type: 'enum',
    enum: LoanType,
  })
  loanType: LoanType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  loanAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number;

  @Column({ type: 'date' })
  loanDate: Date;

  @Column({ type: 'date' })
  maturityDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentFrequency,
  })
  paymentFrequency: PaymentFrequency;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paymentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.ACTIVE,
  })
  status: LoanStatus;

  @Column({ type: 'uuid', nullable: true })
  accountId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @OneToMany(() => LoanPayment, (payment) => payment.loan)
  payments: LoanPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

