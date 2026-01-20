import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export enum TaxType {
  VAT = 'vat',
  WITHHOLDING = 'withholding',
  SALES_TAX = 'sales_tax',
  INCOME_TAX = 'income_tax',
}

export enum CalculationMethod {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('tax_configurations')
export class TaxConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, name: 'tax_code' })
  taxCode: string;

  @Column({ type: 'varchar', name: 'tax_name' })
  taxName: string;

  @Column({
    type: 'enum',
    enum: TaxType,
    name: 'tax_type',
  })
  taxType: TaxType;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0, name: 'tax_rate' })
  taxRate: number;

  @Column({
    type: 'enum',
    enum: CalculationMethod,
    name: 'calculation_method',
  })
  calculationMethod: CalculationMethod;

  @Column({ type: 'boolean', default: false, name: 'is_inclusive' })
  isInclusive: boolean;

  @Column({ type: 'jsonb', name: 'applies_to' })
  appliesTo: string[];

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'date', nullable: true, name: 'effective_from' })
  effectiveFrom: Date | null;

  @Column({ type: 'date', nullable: true, name: 'effective_to' })
  effectiveTo: Date | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

