import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';

export enum DepreciationStatus {
  PENDING = 'pending',
  POSTED = 'posted',
}

@Entity('depreciations')
export class Depreciation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'uuid', name: 'asset_id' })
  assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'varchar', nullable: true, name: 'asset_code' })
  assetCode: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'asset_name' })
  assetName: string | null;

  @Column({ type: 'date', name: 'depreciation_date' })
  depreciationDate: Date;

  @Column({ type: 'varchar', name: 'period' })
  period: string; // Format: YYYY-MM

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'depreciation_amount' })
  depreciationAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'accumulated_depreciation' })
  accumulatedDepreciation: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'net_book_value' })
  netBookValue: number;

  @Column({
    type: 'enum',
    enum: DepreciationStatus,
    default: DepreciationStatus.PENDING,
  })
  status: DepreciationStatus;

  @Column({ type: 'uuid', nullable: true, name: 'journal_entry_id' })
  journalEntryId: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

