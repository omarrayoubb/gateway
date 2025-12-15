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
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { ShipmentItem } from './shipment-item.entity';

export enum ShipmentType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, name: 'shipment_number' })
  shipmentNumber: string;

  @Column({
    type: 'enum',
    enum: ShipmentType,
  })
  type: ShipmentType;

  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true, name: 'to_warehouse_id' })
  toWarehouseId: string | null;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'to_warehouse_id' })
  toWarehouse: Warehouse | null;

  @Column({ type: 'uuid', nullable: true, name: 'vendor_id' })
  vendorId: string | null;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor | null;

  @Column({ type: 'varchar', nullable: true, name: 'customer_name' })
  customerName: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'tracking_number' })
  trackingNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  carrier: string | null;

  @Column({ type: 'date', name: 'shipment_date' })
  shipmentDate: Date;

  @Column({ type: 'date', nullable: true, name: 'expected_delivery' })
  expectedDelivery: Date | null;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => ShipmentItem, (item) => item.shipment, { cascade: true })
  items: ShipmentItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

