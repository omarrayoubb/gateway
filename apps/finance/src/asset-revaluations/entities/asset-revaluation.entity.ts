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

export enum RevaluationType {
  UPWARD = 'upward',
  DOWNWARD = 'downward',
}

export enum RevaluationStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  POSTED = 'posted',
}

@Entity('asset_revaluations')
export class AssetRevaluation {
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

  @Column({ type: 'date', name: 'revaluation_date' })
  revaluationDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'previous_value' })
  previousValue: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'new_value' })
  newValue: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'revaluation_amount' })
  revaluationAmount: number;

  @Column({
    type: 'enum',
    enum: RevaluationType,
    name: 'revaluation_type',
  })
  revaluationType: RevaluationType;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: RevaluationStatus,
    default: RevaluationStatus.DRAFT,
  })
  status: RevaluationStatus;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @Column({ type: 'uuid', nullable: true, name: 'journal_entry_id' })
  journalEntryId: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

