import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dept_name' })
  deptName: string;

  @Column({ name: 'dept_manager_id', type: 'uuid', nullable: true })
  deptManagerId: string | null;
}
