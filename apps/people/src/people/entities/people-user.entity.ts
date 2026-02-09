import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PeopleUserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  HR = 'hr',
  ADMIN = 'admin',
}

@Entity('people_users')
export class PeopleUser {
  @PrimaryColumn('uuid')
  id: string; // Same as Accounts user id; also Employee.id in people

  @Column({
    type: 'enum',
    enum: PeopleUserRole,
    default: PeopleUserRole.EMPLOYEE,
  })
  role: PeopleUserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
