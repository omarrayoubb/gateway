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
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/accounts.entity';
import { Contact } from '../../contacts/entities/contacts.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { RFQ } from '../../rfqs/entities/rfq.entity';
import { SalesOrderProduct } from './sales-order-product.entity';

export enum SalesOrderStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  subject: string;

  @Column({ name: 'customer_no', nullable: true })
  customer_no: string;

  @Column({ nullable: true })
  pending: string;

  @Column({ nullable: true })
  carrier: string;

  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    nullable: true,
    name: 'sales_commission',
  })
  sales_commission: number | null;

  @Column({ nullable: false, default: 'EGP' })
  currency: string;

  @Column({
    type: 'numeric',
    precision: 19,
    scale: 6,
    nullable: true,
    name: 'exchange_rate',
  })
  exchange_rate: number | null;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  due_date: Date | null;

  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    nullable: true,
    name: 'excise_duty',
  })
  excise_duty: number | null;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.id, { nullable: false })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'uuid', name: 'contact_id', nullable: true })
  contactId: string | null;

  @ManyToOne(() => Contact, (contact) => contact.id, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact | null;

  @Column({ type: 'uuid', name: 'deal_id', nullable: true })
  dealId: string | null;

  @ManyToOne(() => Deal, (deal) => deal.id, { nullable: true })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal | null;

  @Column({ type: 'uuid', name: 'rfq_id', nullable: true })
  rfqId: string | null;

  @ManyToOne(() => RFQ, (rfq) => rfq.id, { nullable: true })
  @JoinColumn({ name: 'rfq_id' })
  quote: RFQ | null;

  @Column({
    type: 'enum',
    enum: SalesOrderStatus,
    default: SalesOrderStatus.CREATED,
  })
  status: SalesOrderStatus;

  @Column({ nullable: true })
  billing_street: string;

  @Column({ nullable: true })
  billing_city: string;

  @Column({ nullable: true })
  billing_state: string;

  @Column({ nullable: true })
  billing_code: string;

  @Column({ nullable: true })
  billing_country: string;

  @Column({ nullable: true })
  shipping_street: string;

  @Column({ nullable: true })
  shipping_city: string;

  @Column({ nullable: true })
  shipping_state: string;

  @Column({ nullable: true })
  shipping_code: string;

  @Column({ nullable: true })
  shipping_country: string;

  @Column({ type: 'numeric', precision: 19, scale: 4, nullable: true })
  total: number;

  @Column({ type: 'numeric', precision: 19, scale: 4, nullable: true })
  subtotal: number;

  @Column({ type: 'numeric', precision: 19, scale: 4, nullable: true })
  discount: number;

  @Column({ type: 'numeric', precision: 19, scale: 4, nullable: true })
  adjustment: number;

  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    nullable: true,
    name: 'grand_total',
  })
  grandtotal: number;

  @Column({ type: 'text', nullable: true, name: 'terms_and_condition' })
  termsandcondition: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => SalesOrderProduct, (item) => item.salesOrder, { cascade: true })
  products: SalesOrderProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

