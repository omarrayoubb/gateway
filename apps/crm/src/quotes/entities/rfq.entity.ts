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
import { Lead } from '../../leads/entities/lead.entity';
import { RFQLineItem } from './rfq-line-item.entity';

@Entity('rfqs')
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rfq_name' })
  rfqName: string;

  @Column({ name: 'rfq_number', unique: true })
  rfqNumber: string; // Quotation Code - user provided

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'uuid', name: 'contact_id', nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ type: 'uuid', name: 'lead_id', nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ name: 'requested_by' })
  requestedBy: string; // RFQ Owner - auto-set from current user

  @Column({ default: 'SUBMITTED' })
  status: string; // COMPLETED or SUBMITTED

  @Column({ nullable: true })
  vendors: string; // Vendors string field

  @Column({ name: 'total_discount_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  totalDiscountPercentage: number;

  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approval_status', default: 'Not Required' })
  approvalStatus: string; // Pending, Approved, Not Required

  @Column({ type: 'uuid', name: 'manufacturer_id', nullable: true })
  manufacturerId: string;

  @Column({ type: 'uuid', name: 'product_line_id', nullable: true })
  productLineId: string;

  @Column({ name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxPercentage: number;

  @Column({ name: 'delivery_terms', nullable: true })
  deliveryTerms: string;

  @Column({ name: 'payment_terms', nullable: true })
  paymentTerms: string;

  @Column({ name: 'special_requirements', nullable: true, type: 'text' })
  specialRequirements: string;

  @Column({ name: 'internal_notes', nullable: true, type: 'text' })
  internalNotes: string;

  @Column({ name: 'additional_notes', nullable: true, type: 'text' })
  additionalNotes: string;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ name: 'submitted_date', type: 'date', nullable: true })
  submittedDate: Date;

  @Column({ type: 'uuid', name: 'generated_quote_id', nullable: true })
  generatedQuoteId: string;

  @Column()
  currency: string; // EGP, USD, or AED

  @OneToMany(() => RFQLineItem, (lineItem) => lineItem.rfq, { cascade: true })
  lineItems: RFQLineItem[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

