import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cash_accounts')
export class CashAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', name: 'account_name' })
  accountName: string;

  @Column({ type: 'varchar', name: 'account_code' })
  accountCode: string;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'opening_balance' })
  openingBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'current_balance' })
  currentBalance: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

