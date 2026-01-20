import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AssetType {
  BUILDING = 'building',
  VEHICLE = 'vehicle',
  EQUIPMENT = 'equipment',
  FURNITURE = 'furniture',
  SOFTWARE = 'software',
  OTHER = 'other',
}

export enum AssetStatus {
  ACTIVE = 'active',
  DISPOSED = 'disposed',
  UNDER_MAINTENANCE = 'under_maintenance',
  RETIRED = 'retired',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  UNITS_OF_PRODUCTION = 'units_of_production',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true, name: 'asset_code' })
  assetCode: string | null;

  @Column({ type: 'varchar', name: 'asset_name' })
  assetName: string;

  @Column({
    type: 'enum',
    enum: AssetType,
    name: 'asset_type',
  })
  assetType: AssetType;

  @Column({ type: 'date', name: 'purchase_date' })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'purchase_price' })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'current_value' })
  currentValue: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'accumulated_depreciation' })
  accumulatedDepreciation: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'net_book_value' })
  netBookValue: number;

  @Column({
    type: 'enum',
    enum: DepreciationMethod,
    name: 'depreciation_method',
  })
  depreciationMethod: DepreciationMethod;

  @Column({ type: 'integer', default: 0, name: 'useful_life_years' })
  usefulLifeYears: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'salvage_value' })
  salvageValue: number;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

