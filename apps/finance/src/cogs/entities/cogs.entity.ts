import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cogs')
export class COGS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'date', name: 'period_start' })
  periodStart: Date;

  @Column({ type: 'date', name: 'period_end' })
  periodEnd: Date;

  @Column({ type: 'uuid', name: 'item_id' })
  itemId: string;

  @Column({ type: 'varchar', nullable: true, name: 'item_code' })
  itemCode: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'item_name' })
  itemName: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'quantity_sold' })
  quantitySold: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'unit_cost' })
  unitCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_cogs' })
  totalCogs: number;

  @Column({ type: 'varchar', default: 'USD', length: 3 })
  currency: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

