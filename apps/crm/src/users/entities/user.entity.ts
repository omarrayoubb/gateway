import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    PrimaryColumn
  } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Account } from '../../accounts/entities/accounts.entity';
import { Role } from '../../roles/entities/role.entity';
  
  @Entity('users') // This decorator marks the class as a table named 'users'
  export class User {
    @PrimaryColumn('uuid')
    id: string; // Was 'id_in_DB', now our primary key

    
    @Column({ unique: true, name: 'work_id' })
    workId: string; // Was 'work_id'
    @Column({ unique: true, nullable: true })
    email: string; // User email address (optional)
    @Column()
    name: string;
   



  
    @Column({ nullable: true })
    department: string;
  
  
    
    // Keep role as string for backward compatibility during migration
    @Column({ nullable: true })
    role: string; // Keep for backward compatibility during migration

    @Column({ type: 'uuid', name: 'role_id', nullable: true })
    roleId: string | null;

    @ManyToOne(() => Role, { nullable: true, eager: false })
    @JoinColumn({ name: 'role_id' })
    roleEntity: Role | null;

    @Column({ type: 'uuid', name: 'profile_id', nullable: true })
    profileId: string;

    @ManyToOne(() => Profile, (profile) => profile.users, { nullable: true, eager: false })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;

    @ManyToMany(() => Account, (account) => account.users)
    @JoinTable({
      name: 'account_users',
      joinColumn: { name: 'user_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'account_id', referencedColumnName: 'id' },
    })
    accounts: Account[];
  
    
  }