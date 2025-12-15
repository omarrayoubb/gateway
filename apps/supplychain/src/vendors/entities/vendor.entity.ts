import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VendorProduct } from '../../vendor-products/entities/vendor-product.entity';
import { VendorPerformance } from '../../vendor-performance/entities/vendor-performance.entity';

export enum VendorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', nullable: true, name: 'contact_person' })
  contactPerson: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'tax_id' })
  taxId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'payment_terms' })
  paymentTerms: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'USD' })
  currency: string | null;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.ACTIVE,
  })
  status: VendorStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, default: 0 })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => VendorProduct, (vendorProduct) => vendorProduct.vendor)
  vendorProducts: VendorProduct[];

  @OneToMany(() => VendorPerformance, (performance) => performance.vendor)
  performances: VendorPerformance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

