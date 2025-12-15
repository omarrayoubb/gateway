import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';
import { Contact } from '../../contacts/entities/contacts.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'activity_type' })
  activityType: string;

  @Column()
  subject: string;

  @Column({ type: 'timestamp', name: 'meeting_date_time' })
  meetingDateTime: Date;

  @Column({ type: 'timestamp', name:"duration" })
  duration: Date;

  @Column({ nullable: true })
  outcome: string;

  @Column()
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Mutually exclusive relationships - only one can be set
  @Column({ type: 'uuid', name: 'lead_id', nullable: true })
  leadId: string | null;

  @ManyToOne(() => Lead, (lead) => lead.activities, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead | null;

  @Column({ type: 'uuid', name: 'contact_id', nullable: true })
  contactId: string | null;

  @ManyToOne(() => Contact, (contact) => contact.activities, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact | null;

  @Column({ type: 'uuid', name: 'deal_id', nullable: true })
  dealId: string | null;

  @ManyToOne('Deal', (deal: any) => deal.activities, { nullable: true })
  @JoinColumn({ name: 'deal_id' })
  deal: any | null;

  @Column({ type: 'uuid', name: 'account_id', nullable: true })
  accountId: string | null;

  @ManyToOne('Account', (account: any) => account.activities, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: any | null;
}

