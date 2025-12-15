import { 
  Entity, 
  Column, 
  PrimaryColumn,
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Profile } from '../profiles/entities/profile.entity';

@Entity('users_sync') // Separate table for synced users from Accounts service
export class UserSync {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'work_id' })
  workId: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ name: 'work_location' })
  workLocation: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true, name: 'dept_manager' })
  deptManager: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  // CRM-specific mandatory fields
  @Column({ type: 'uuid', name: 'role_id', nullable: true })
  roleId: string | null;

  @ManyToOne(() => Role, { nullable: true, eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role | null;

  @Column({ type: 'uuid', name: 'profile_id', nullable: true })
  profileId: string | null;

  @ManyToOne(() => Profile, { nullable: true, eager: false })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

