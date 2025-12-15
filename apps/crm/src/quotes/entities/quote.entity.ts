import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';
import { Contact } from '../../contacts/entities/contacts.entity';
import { RFQ } from './rfq.entity';
import { QuoteLineItem } from './quote-line-item.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quote_number', unique: true })
  quoteNumber: string;

  @Column({ name: 'quote_name' })
  quoteName: string;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'uuid', name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'created_by_email' })
  createdByEmail: string;

  @Column({ default: 'Draft' })
  status: string; // Draft, Pending Approval, Approved, Sent, Accepted

  @Column({ name: 'approval_status', default: 'Not Submitted' })
  approvalStatus: string; // Pending, Approved, Not Required, Not Submitted

  @Column({ type: 'uuid', name: 'rfq_id', nullable: true })
  rfqId: string;

  @ManyToOne(() => RFQ, { nullable: true })
  @JoinColumn({ name: 'rfq_id' })
  rfq: RFQ;

  @Column({ name: 'rfq_type', nullable: true })
  rfqType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @Column({ name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxPercentage: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ name: 'delivery_terms', nullable: true })
  deliveryTerms: string;

  @Column({ name: 'payment_terms', nullable: true })
  paymentTerms: string;

  @Column({ name: 'customer_notes', nullable: true, type: 'text' })
  customerNotes: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil: Date;

  @Column()
  currency: string; // USD, EGP, AED, SAR

  @OneToMany(() => QuoteLineItem, (lineItem) => lineItem.quote, { cascade: true })
  lineItems: QuoteLineItem[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

