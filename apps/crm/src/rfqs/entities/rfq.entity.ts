import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';
import { Contact } from '../../contacts/entities/contacts.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { RFQProduct } from './rfq-product.entity';

export enum RFQCurrency {
  USD = 'USD',
  AED = 'AED',
  EGP = 'EGP',
}

export enum RFQStatus {
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
}

@Entity('rfqs')
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'rfq_name' })
  rfqName: string;

  @Column({ name: 'rfq_number', unique: true })
  rfqNumber: string;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'uuid', name: 'contact_id', nullable: true })
  contactId: string | null;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact | null;

  @Column({ type: 'uuid', name: 'lead_id', nullable: true })
  leadId: string | null;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead | null;

  @Column({ type: 'uuid', name: 'vendor_id', nullable: true })
  vendorId: string | null; // Reference to supplychain vendor (not FK)

  @Column({
    type: 'enum',
    enum: RFQCurrency,
    default: RFQCurrency.USD,
  })
  currency: RFQCurrency;

  @Column({
    type: 'enum',
    enum: RFQStatus,
    default: RFQStatus.SUBMITTED,
  })
  status: RFQStatus;

  @Column({ name: 'payment_terms', nullable: true, type: 'text' })
  paymentTerms: string | null;

  @Column({ name: 'additional_notes', nullable: true, type: 'text' })
  additionalNotes: string | null;

  @OneToMany(() => RFQProduct, (rfqProduct) => rfqProduct.rfq, { cascade: true })
  rfqProducts: RFQProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

