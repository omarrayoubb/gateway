import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Manufacturer } from './manufacturer.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'product_code' })
  productCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'uuid', name: 'manufacturer_id', nullable: true })
  manufacturerId: string;

  @ManyToOne(() => Manufacturer, { nullable: true })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Manufacturer;

  @Column({ type: 'uuid', name: 'product_line_id', nullable: true })
  productLineId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

