import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

export enum TrackingUpdateType {
  SYSTEM = 'system',
  MANUAL = 'manual',
}

@Entity('shipment_tracking')
export class ShipmentTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamp', name: 'timestamp' })
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: TrackingUpdateType,
    default: TrackingUpdateType.MANUAL,
    name: 'updated_by',
  })
  updatedBy: TrackingUpdateType;

  @Column({ type: 'boolean', default: false, name: 'is_automated' })
  isAutomated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

