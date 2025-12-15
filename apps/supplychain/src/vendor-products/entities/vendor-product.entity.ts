import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Product } from '../../products/entities/product.entity';

export enum VendorProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

@Entity('vendor_products')
export class VendorProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', nullable: true, name: 'vendor_sku' })
  vendorSku: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'int', default: 1, name: 'minimum_order_quantity' })
  minimumOrderQuantity: number;

  @Column({ type: 'int', nullable: true, name: 'lead_time_days' })
  leadTimeDays: number | null;

  @Column({
    type: 'enum',
    enum: VendorProductStatus,
    default: VendorProductStatus.ACTIVE,
  })
  status: VendorProductStatus;

  @Column({ type: 'jsonb', nullable: true, name: 'price_tiers' })
  priceTiers: Array<{ minQuantity: number; price: number }> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

