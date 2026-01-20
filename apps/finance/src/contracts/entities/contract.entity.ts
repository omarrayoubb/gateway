import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ContractPayment } from './contract-payment.entity';

export enum ContractType {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  EMPLOYEE = 'employee',
  OTHER = 'other',
}

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

export enum PartyType {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  EMPLOYEE = 'employee',
}

export enum BillingFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  ONE_TIME = 'one_time',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 100 })
  contractNumber: string;

  @Column({ type: 'varchar', length: 255 })
  contractName: string;

  @Column({
    type: 'enum',
    enum: ContractType,
  })
  contractType: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @Column({
    type: 'enum',
    enum: PartyType,
    nullable: true,
  })
  partyType: PartyType | null;

  @Column({ type: 'uuid', nullable: true })
  partyId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  partyName: string | null;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  paymentTerms: string | null;

  @Column({
    type: 'enum',
    enum: BillingFrequency,
    nullable: true,
  })
  billingFrequency: BillingFrequency | null;

  @Column({ type: 'boolean', default: false })
  autoRenew: boolean;

  @Column({ type: 'date', nullable: true })
  renewalDate: Date | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ type: 'uuid', nullable: true })
  costCenterId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  documentUrl: string | null;

  @Column({ type: 'date', nullable: true })
  activationDate: Date | null;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date | null;

  @Column({ type: 'text', nullable: true })
  terminationReason: string | null;

  @OneToMany(() => ContractPayment, (payment) => payment.contract)
  payments: ContractPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

