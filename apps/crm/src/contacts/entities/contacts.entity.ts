import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';
import { User } from '../../users/entities/user.entity';
@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- CRITICAL REQUIRED FIELDS (I've added these) ---
  @Column({ nullable: true })
  salutation: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  // --- PRIMARY INFO ---
  @Column({ unique: true })
  email: string; // From your "Lead email"

  @Column({ nullable: true })
  phone: string; // From your "Lead Phone"

  @Column({ nullable: true })
  mobile_phone: string; // From your "Mobile"

  // --- USER RELATIONSHIPS ---
  @Column({ type: 'uuid', name: 'owner_id', nullable: true })
  ownerId: string; // "Contact Owner"

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
  
  @Column({ name: 'created_by' })
  createdBy: string; // "Created By" - user name

  @Column({ name: 'modified_by' })
  modifiedBy: string; // "Modified By" - user name

  // --- DENORMALIZED COMPANY INFO ---
  
  // 2. REMOVE account_name
  // @Column({ nullable: true })
  // account_name: string; // "Account Name"

  // 3. ADD accountId and relation
  @Column({ type: 'uuid', name: 'account_id', nullable: true })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.contacts, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ nullable: true })
  department: string; // "Department in his company"

  @Column({ nullable: true })
  government_code: string;

  @Column({ nullable: true })
  territory: string; // "Territories"

  @Column({ nullable: true })
  secondary_phone: string;

  @Column({ nullable: true })
  assistant_name: string; // "Assistant"

  // --- DENORMALIZED ERP / INTERNAL INFO ---
  @Column({ nullable: true })
  currency_code: string; // "Currency"

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  wp_number: string; // "WP Number"

  @Column({ nullable: true })
  box_folder_id: string;

  @Column({ nullable: true })
  assigned_profile: string;

  @Column({ nullable: true })
  user_permissions: string;

  // --- MAILING ADDRESS ---
  @Column({ nullable: true })
  mailing_street: string;

  @Column({ nullable: true })
  mailing_city: string;

  @Column({ nullable: true })
  mailing_state: string;

  @Column({ nullable: true })
  mailing_zip: string;

  @Column({ nullable: true })
  mailing_country: string;

  // Using string reference to avoid circular dependency
  @OneToMany('Deal', 'contact')
  deals: any[];

  // Activities relationship
  @OneToMany('Activity', 'contact')
  activities: any[];

  // --- TIMESTAMPS ---
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}