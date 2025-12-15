import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductAlert } from '../../product-alerts/entities/product-alert.entity';

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.ACTIVE,
  })
  status: WarehouseStatus;

  @Column({ type: 'boolean', default: false, name: 'temperature_controlled' })
  temperatureControlled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'min_temperature' })
  minTemperature: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'max_temperature' })
  maxTemperature: number | null;

  @Column({ type: 'varchar', nullable: true, name: 'contact_phone' })
  contactPhone: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'contact_email' })
  contactEmail: string | null;

  @OneToMany(() => ProductAlert, (alert) => alert.warehouse)
  alerts: ProductAlert[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

