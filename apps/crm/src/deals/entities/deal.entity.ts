import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserSync } from '../../users/users-sync.entity';
import { Account } from '../../accounts/entities/accounts.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Contact } from '../../contacts/entities/contacts.entity';

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Deal Name - Required

  @Column({ type: 'decimal', precision: 19, scale: 4, nullable: true })
  amount: number;

  @Column({ type: 'date', nullable: true, name: 'closing_date' })
  closingDate: Date | null;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  stage: string;

  @Column({ type: 'numeric', nullable: true })
  probability: number; // Percentage

  @Column({ nullable: true, name: 'lead_source' })
  leadSource: string; // Lead Source must be stored

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, name: 'box_folder_id' })
  boxFolderId: string; // Box Folder Id

  @Column({ nullable: true, name: 'campaign_source' })
  campaignSource: string; // Campaign Source

  @Column({ nullable: true })
  quote: string;

  // --- RELATIONSHIPS ---
  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string; // Required

  @ManyToOne(() => UserSync, { nullable: false, eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: UserSync;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string; // Required

  @ManyToOne(() => Account, (account) => account.deals, { nullable: false, eager: false })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'uuid', name: 'lead_id', nullable: true })
  leadId: string | null; // Optional, mutually exclusive with contact

  @ManyToOne(() => Lead, (lead) => lead.deals, { nullable: true, eager: false })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ type: 'uuid', name: 'contact_id', nullable: true })
  contactId: string | null; // Optional, mutually exclusive with lead

  @ManyToOne(() => Contact, (contact) => contact.deals, { nullable: true, eager: false })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  // --- STRING FIELDS (NOT FOREIGN KEYS) ---
  @Column({ name: 'created_by' })
  createdBy: string; // String field, NOT a foreign key

  @Column({ name: 'modified_by' })
  modifiedBy: string; // String field, NOT a foreign key

  // --- TIMESTAMPS ---
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

