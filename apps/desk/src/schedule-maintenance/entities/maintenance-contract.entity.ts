import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('maintenance_contracts')
export class MaintenanceContract extends BaseEntity {
  @Column({ nullable: true })
  contract_number: string;

  @Column()
  contract_name: string;

  @Column({ nullable: true })
  contract_type: string; // "Preventive Maintenance" | "Corrective Maintenance" | "Full Service"

  @Column({ default: 'Active' })
  status: string; // "Active" | "Inactive" | "Expired"

  @Column('uuid', { nullable: true })
  account_id: string;

  @Column('uuid', { nullable: true })
  contact_id: string;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ nullable: true })
  service_frequency: string; // "Monthly" | "Quarterly" | "Semi-Annual" | "Annual"

  @Column({ type: 'int', nullable: true })
  visits_per_year: number;

  @Column({ type: 'int', default: 0 })
  visits_completed: number;

  @Column({ type: 'int', nullable: true })
  visits_remaining: number;

  @Column({ nullable: true })
  preferred_day_of_week: string;

  @Column({ nullable: true })
  preferred_time_slot: string;

  @Column({ default: false })
  auto_schedule_enabled: boolean;

  @Column({ nullable: true })
  assigned_technician: string;

  @Column({ nullable: true })
  service_location: string;

  @Column('text', { nullable: true })
  special_instructions: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  contract_value: number;

  @Column({ nullable: true })
  billing_frequency: string; // "Monthly" | "Quarterly" | "Annual"

  @Column({ default: false })
  includes_parts: boolean;

  @Column({ default: false })
  includes_labor: boolean;

  @Column({ default: false })
  emergency_coverage: boolean;

  @Column({ default: false })
  auto_renewal: boolean;

  @Column({ type: 'int', nullable: true })
  sla_response_time_hours: number;

  @Column({ type: 'timestamp', nullable: true })
  next_scheduled_visit: Date;
}

