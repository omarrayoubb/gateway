import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BankAccount } from '../../bank-accounts/entities/bank-account.entity';

export enum ChequeType {
  ISSUED = 'issued',
  RECEIVED = 'received',
}

export enum ChequeStatus {
  PENDING = 'pending',
  DEPOSITED = 'deposited',
  CLEARED = 'cleared',
  BOUNCED = 'bounced',
  VOID = 'void',
}

@Entity('cheques')
export class Cheque {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', name: 'cheque_number' })
  chequeNumber: string;

  @Column({
    type: 'enum',
    enum: ChequeType,
  })
  type: ChequeType;

  @Column({ type: 'date', name: 'cheque_date' })
  chequeDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({ type: 'varchar', name: 'payee_name' })
  payeeName: string;

  @Column({ type: 'varchar', nullable: true, name: 'bank_name' })
  bankName: string | null;

  @Column({
    type: 'enum',
    enum: ChequeStatus,
    default: ChequeStatus.PENDING,
  })
  status: ChequeStatus;

  @Column({ type: 'uuid', nullable: true, name: 'bank_account_id' })
  bankAccountId: string | null;

  @ManyToOne(() => BankAccount, { nullable: true })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount | null;

  @Column({ type: 'date', nullable: true, name: 'deposit_date' })
  depositDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'clear_date' })
  clearDate: Date | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

