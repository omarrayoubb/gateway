import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../people/entities/person.entity';

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  HR = 'hr',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_ACTIVATION = 'pending_activation',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'uuid', nullable: true, name: 'employee_id' })
  employeeId: string | null;

  @OneToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_ACTIVATION,
  })
  status: UserStatus;

  @Column({ type: 'varchar', nullable: true, name: 'activation_token' })
  activationToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'activation_token_expires' })
  activationTokenExpires: Date | null;

  @Column({ type: 'varchar', nullable: true, name: 'password_reset_token' })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'password_reset_expires' })
  passwordResetExpires: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login' })
  lastLogin: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
