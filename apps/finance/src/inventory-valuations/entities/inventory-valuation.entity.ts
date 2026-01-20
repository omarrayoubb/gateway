import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ValuationMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  WEIGHTED_AVERAGE = 'weighted_average',
  SPECIFIC_IDENTIFICATION = 'specific_identification',
}

@Entity('inventory_valuations')
export class InventoryValuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'uuid', name: 'item_id' })
  itemId: string;

  @Column({ type: 'varchar', nullable: true, name: 'item_code' })
  itemCode: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'item_name' })
  itemName: string | null;

  @Column({ type: 'date', name: 'valuation_date' })
  valuationDate: Date;

  @Column({
    type: 'enum',
    enum: ValuationMethod,
    name: 'valuation_method',
  })
  valuationMethod: ValuationMethod;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'unit_cost' })
  unitCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_value' })
  totalValue: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

