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

export enum DisposalMethod {
  SALE = 'sale',
  SCRAP = 'scrap',
  DONATION = 'donation',
  WRITE_OFF = 'write_off',
}

export enum DisposalStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  POSTED = 'posted',
}

@Entity('asset_disposals')
export class AssetDisposal {
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

  @Column({ type: 'date', name: 'disposal_date' })
  disposalDate: Date;

  @Column({
    type: 'enum',
    enum: DisposalMethod,
    name: 'disposal_method',
  })
  disposalMethod: DisposalMethod;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'disposal_amount' })
  disposalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'net_book_value' })
  netBookValue: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'gain_loss' })
  gainLoss: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: DisposalStatus,
    default: DisposalStatus.DRAFT,
  })
  status: DisposalStatus;

  @Column({ type: 'uuid', nullable: true, name: 'account_id' })
  accountId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'journal_entry_id' })
  journalEntryId: string | null;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

