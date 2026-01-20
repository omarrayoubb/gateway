import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
}

@Entity('stock_impacts')
export class StockImpact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({
    type: 'enum',
    enum: TransactionType,
    name: 'transaction_type',
  })
  transactionType: TransactionType;

  @Column({ type: 'uuid', name: 'item_id' })
  itemId: string;

  @Column({ type: 'varchar', nullable: true, name: 'item_code' })
  itemCode: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'item_name' })
  itemName: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'unit_cost' })
  unitCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_cost' })
  totalCost: number;

  @Column({ type: 'uuid', nullable: true, name: 'inventory_account_id' })
  inventoryAccountId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'cogs_account_id' })
  cogsAccountId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'expense_account_id' })
  expenseAccountId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'reference_id' })
  referenceId: string | null; // Reference to invoice, purchase bill, adjustment, etc.

  @Column({ type: 'varchar', nullable: true, name: 'reference_type' })
  referenceType: string | null; // 'invoice', 'purchase_bill', 'adjustment', 'transfer'

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

