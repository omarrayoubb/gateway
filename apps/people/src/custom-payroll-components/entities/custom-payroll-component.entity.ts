import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum ComponentType {
  ALLOWANCE = 'allowance',
  DEDUCTION = 'deduction',
  BONUS = 'bonus',
}

@Entity('custom_payroll_components')
export class CustomPayrollComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ComponentType,
  })
  type: ComponentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50, name: 'applies_to' })
  appliesTo: string; // e.g., 'all', 'department-1', 'employee-1'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
