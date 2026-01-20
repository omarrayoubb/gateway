import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('payment_allocations')
export class CustomerPaymentAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'customer_payment_id' })
  customerPaymentId: string;

  @ManyToOne('CustomerPayment', 'allocations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_payment_id' })
  customerPayment: any;

  @Column({ type: 'uuid', name: 'invoice_id' })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

