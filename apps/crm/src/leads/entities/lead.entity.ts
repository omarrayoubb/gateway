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
  import {User} from '../../users/entities/user.entity';
  import {Account} from '../../accounts/entities/accounts.entity';
  /**
   * This entity defines the 'leads' table in your database.
   */
  @Entity('leads')
  export class Lead {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // --- NEW REQUIRED FIELDS ---
    // These are not nullable
    @Column({ nullable: true })
    salutation: string;
  
    @Column()
    first_name: string;
  
    @Column()
    last_name: string;
  
    @Column()
    phone: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column({ nullable: true })
    shipping_street: string; // "shipping address one of them"
  
    @Column({ nullable: true })
    billing_city: string;
  
    // --- OTHER FIELDS (Optional) ---
    
    // 2. REMOVE account_name
    // @Column({ nullable: true })
    // account_name: string;
  
    // 3. ADD accountId and relation
    @Column({ type: 'uuid', name: 'account_id', nullable: true })
    accountId: string;

    @ManyToOne(() => Account, (account) => account.leads, { nullable: true })
    @JoinColumn({ name: 'account_id' })
    account: Account;
  
  
    @Column({ nullable: true })
    product_name: string;
    
    @Column({ nullable: true })
    currency_code: string;
  
    @Column({ type: 'int', nullable: true })
    employee_count: number;
  
    @Column({ nullable: true })
    hq_code: string;
  
    @Column({ type: 'decimal', precision: 19, scale: 4, nullable: true })
    billing_amount: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    exchange_rate: number;
  
    @Column({ nullable: true })
    shipping_street_2: string;
  
    @Column({ nullable: true })
    shipping_city: string;
  
    @Column({ nullable: true })
    shipping_state: string;
  
    @Column({ nullable: true })
    shipping_country: string;
  
    @Column({ nullable: true })
    shipping_zip_code: string;
  
    @Column({ nullable: true })
    billing_street: string; // You listed "billing address" twice
  
    @Column({ nullable: true })
    billing_street_2: string; // So I've named them _street and _street_2
  
    @Column({ nullable: true })
    billing_state: string;
    
    @Column({ nullable: true })
    billing_country: string;
  
    @Column({ nullable: true })
    billing_zip_code: string;
  
    // --- RELATIONSHIPS (As requested) ---
    @Column({ type: 'uuid', name: 'owner_id', nullable: true })
    ownerId: string;
  
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'owner_id' })
    owner: User;
    
    @Column({ name: 'created_by' })
    createdBy: string; // "Created By" - user name
  
    @Column({ name: 'modified_by' })
    modifiedBy: string; // "Modified By" - user name
  
    // Using string reference to avoid circular dependency
    @OneToMany('Deal', 'lead')
    deals: any[];

    // Activities relationship
    @OneToMany('Activity', 'lead')
    activities: any[];
  
    // --- TIMESTAMPS ---
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }