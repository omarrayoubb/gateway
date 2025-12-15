import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    ManyToOne,
    ManyToMany,
    JoinColumn,
    OneToMany
  } from 'typeorm';
import {User} from '../../users/entities/user.entity';
import {Lead} from '../../leads/entities/lead.entity';
import {Contact} from '../../contacts/entities/contacts.entity';
    
  @Entity('accounts')
  export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    name: string;
  
    // --- NEW REQUIRED FIELD ---
    @Column({ unique: true, nullable: true, name: 'account_number' })
    accountNumber: string;
  
    @Column({ nullable: true })
    phone: string;
  
    @Column({ nullable: true })
    website: string;
  
    // --- Address Fields ---
    @Column() // <-- No longer nullable
    billing_street: string;
    
    @Column() // <-- No longer nullable
    billing_city: string;
    
    @Column({ nullable: true })
    billing_state: string;
    
    @Column({ nullable: true })
    billing_zip: string;
    
    @Column({ nullable: true })
    billing_country: string;
  
    @Column({ nullable: true })
    shipping_street: string;
    
    @Column({ nullable: true })
    shipping_city: string;
    
    @Column({ nullable: true })
    shipping_state: string;
    
    @Column({ nullable: true })
    shipping_zip: string;
    
  @Column({ nullable: true })
  shipping_country: string;

  // --- NEW: Business Classification Fields ---
  @Column({ nullable: true })
  territory: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true, name: 'account_type' })
  accountType: string;

  @Column({ nullable: true })
  ownership: string;

  // --- NEW: PARENT ACCOUNT RELATIONSHIP ---
  @Column({ type: 'uuid', name: 'parent_account_id', nullable: true })
  parentAccountId: string;
  
    @ManyToOne(() => Account, (account) => account.childAccounts, { nullable: true })
    @JoinColumn({ name: 'parent_account_id' })
    parentAccount: Account;
  
    @OneToMany(() => Account, (account) => account.parentAccount)
    childAccounts: Account[];
  
    // --- User Relationships (ManyToMany) ---
    @ManyToMany(() => User, (user) => user.accounts)
    users: User[];
    
    @Column({ name: 'created_by' })
    createdBy: string; // "Created By" - user name
  
    @Column({ name: 'modified_by' })
    modifiedBy: string; // "Modified By" - user name
  
    // --- Relationships to other modules ---
    @OneToMany(() => Lead, (lead) => lead.account)
    leads: Lead[];

    @OneToMany(() => Contact, (contact) => contact.account)
    contacts: Contact[];

    // Using string reference to avoid circular dependency
    @OneToMany('Deal', 'account')
    deals: any[];

    @OneToMany('Activity', 'account')
    activities: any[];

    // --- Timestamps ---
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }