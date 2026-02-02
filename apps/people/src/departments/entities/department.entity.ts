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

export enum DepartmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'manager_email' })
  managerEmail: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'parent_department_id' })
  parentDepartmentId: string | null;

  @ManyToOne(() => Department, (department) => department.children, { nullable: true })
  @JoinColumn({ name: 'parent_department_id' })
  parentDepartment: Department | null;

  @OneToMany(() => Department, (department) => department.parentDepartment)
  children: Department[];

  @Column({
    type: 'enum',
    enum: DepartmentStatus,
    default: DepartmentStatus.ACTIVE,
  })
  status: DepartmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

