import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  quota: number;

  @Column({ type: 'boolean', default: false, name: 'carry_forward' })
  carryForward: boolean;

  @Column({ type: 'boolean', default: true, name: 'requires_approval' })
  requiresApproval: boolean;

  @Column({ type: 'boolean', default: false, name: 'track_in_hours' })
  trackInHours: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

