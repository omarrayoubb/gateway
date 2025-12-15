import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('installation_base')
export class InstallationBase extends BaseEntity {
  @Column()
  equipment_name: string;

  @Column({ nullable: true })
  serial_number: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @Column('uuid', { nullable: true })
  account_id: string;

  @Column('uuid', { nullable: true })
  contact_id: string;

  @Column({ type: 'timestamp', nullable: true })
  installation_date: Date;

  @Column({ nullable: true })
  installation_location: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'timestamp', nullable: true })
  warranty_start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  warranty_end_date: Date;

  @Column({ nullable: true })
  warranty_status: string; // "Active" | "Expired" | "Void"

  @Column({ nullable: true })
  condition: string; // "Good" | "Fair" | "Poor" | "Needs Repair"

  @Column({ nullable: true })
  lifecycle_status: string; // "In Use" | "Disposed" | "Sold" | "Returned to Vendor"

  @Column({ type: 'int', nullable: true })
  expected_lifespan_years: number;

  @Column({ type: 'timestamp', nullable: true })
  end_of_life_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_ppm_date: Date;

  @Column({ type: 'int', default: 0 })
  total_service_calls: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_downtime_hours: number;

  @Column({ default: false })
  eol_alert_sent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  eol_alert_date: Date;
}

