import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  position: string | null;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'department_id' })
  departmentId: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'job_title' })
  jobTitle: string | null;

  @Column({ type: 'date', nullable: true, name: 'hire_date' })
  hireDate: Date | null;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({ type: 'varchar', nullable: true, name: 'manager_email' })
  managerEmail: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'manager_id' })
  managerId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string | null;

  @Column({ type: 'int', nullable: true, name: 'hierarchy_level' })
  hierarchyLevel: number | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'emergency_contact_name' })
  emergencyContactName: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'emergency_contact_phone' })
  emergencyContactPhone: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'emergency_contact_relationship' })
  emergencyContactRelationship: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'base_salary' })
  baseSalary: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

