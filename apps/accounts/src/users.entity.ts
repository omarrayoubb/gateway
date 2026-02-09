import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from './department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'work_id' })
  workId: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  name: string;

  @Column({ name: 'password', select: false })
  password: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ name: 'work_location' })
  workLocation: string;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @Column({ nullable: true })
  role: string;

  @CreateDateColumn({ name: 'date_joined' })
  dateJoined: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Extended profile fields
  @Column({ nullable: true })
  status: string; // e.g. active, inactive, pending_activation

  @Column({ nullable: true })
  position: string;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate: Date | null;

  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string | null;

  @Column({ name: 'hierarchy_level', type: 'int', nullable: true })
  hierarchyLevel: number | null;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Column({ name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship: string;

  @Column({ name: 'base_salary', type: 'decimal', precision: 12, scale: 2, nullable: true })
  baseSalary: string | null;
}
