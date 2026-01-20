import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdjustmentType {
  WRITE_OFF = 'write_off',
  WRITE_UP = 'write_up',
  REVALUATION = 'revaluation',
  OTHER = 'other',
}

export enum AdjustmentStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
}

@Entity('inventory_adjustments')
export class InventoryAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'adjustment_number' })
  adjustmentNumber: string | null;

  @Column({ type: 'date', name: 'adjustment_date' })
  adjustmentDate: Date;

  @Column({
    type: 'enum',
    enum: AdjustmentType,
    name: 'adjustment_type',
  })
  adjustmentType: AdjustmentType;

  @Column({ type: 'uuid', name: 'item_id' })
  itemId: string;

  @Column({ type: 'varchar', nullable: true, name: 'item_code' })
  itemCode: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'quantity_adjusted' })
  quantityAdjusted: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'unit_cost' })
  unitCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'adjustment_amount' })
  adjustmentAmount: number;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: AdjustmentStatus,
    default: AdjustmentStatus.DRAFT,
  })
  status: AdjustmentStatus;

  @Column({ type: 'uuid', nullable: true, name: 'journal_entry_id' })
  journalEntryId: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

