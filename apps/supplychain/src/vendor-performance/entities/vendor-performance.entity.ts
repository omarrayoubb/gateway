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

@Entity('vendor_performance')
export class VendorPerformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'date', name: 'period_start' })
  periodStart: Date;

  @Column({ type: 'date', name: 'period_end' })
  periodEnd: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'on_time_delivery_rate' })
  onTimeDeliveryRate: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'quality_score' })
  qualityScore: number | null;

  @Column({ type: 'int', default: 0, name: 'total_orders' })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

