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

export enum TaxType {
  VAT = 'vat',
  INCOME_TAX = 'income_tax',
  SALES_TAX = 'sales_tax',
  WITHHOLDING = 'withholding',
}

export enum TaxPayableStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity('tax_payables')
export class TaxPayable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({
    type: 'enum',
    enum: TaxType,
  })
  taxType: TaxType;

  @Column({ type: 'varchar', length: 7 }) // Format: YYYY-MM
  taxPeriod: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TaxPayableStatus,
    default: TaxPayableStatus.PENDING,
  })
  status: TaxPayableStatus;

  @Column({ type: 'uuid', nullable: true })
  accountId: string | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'date', nullable: true })
  paidDate: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'uuid', nullable: true })
  bankAccountId: string | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: Account;

  @Column({ type: 'uuid', nullable: true })
  journalEntryId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

