import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Loan } from './loan.entity';
import { Account } from '../../accounts/entities/account.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity('loan_payments')
export class LoanPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  loanId: string;

  @ManyToOne(() => Loan, (loan) => loan.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'int' })
  paymentNumber: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paymentAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  principalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  interestAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  bankAccountId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: Account;

  @Column({ type: 'uuid', nullable: true })
  journalEntryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

