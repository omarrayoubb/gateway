import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';
import { ProductAlert } from '../../product-alerts/entities/product-alert.entity';

export enum ProductType {
  SINGLE = 'single',
  KIT = 'kit',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

export enum ProductTemperature {
  ROOM_TEMPERATURE = 'Room temperature',
  FOUR_TO_EIGHT = '4-8',
  MINUS_TWENTY = '-20',
  MINUS_EIGHTY = '-80',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  sku: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.SINGLE,
  })
  type: ProductType;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => ProductCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'cost_price' })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'selling_price' })
  sellingPrice: number;

  @Column({ type: 'int', default: 0, name: 'reorder_point' })
  reorderPoint: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ type: 'varchar', nullable: true, unique: true })
  barcode: string | null;

  @Column({ type: 'varchar', nullable: true })
  gtin: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'unit_of_measure' })
  unitOfMeasure: string | null;

  @Column({ type: 'uuid', name: 'default_warehouse_id', nullable: true })
  defaultWarehouseId: string | null;

  @Column({
    type: 'enum',
    enum: ProductTemperature,
    nullable: true,
  })
  temperature: ProductTemperature | null;

  @OneToMany(() => ProductAlert, (alert) => alert.product)
  alerts: ProductAlert[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

