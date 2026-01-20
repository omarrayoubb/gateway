import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('vendor_payment_allocations')
export class VendorPaymentAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'vendor_payment_id' })
  vendorPaymentId: string;

  @ManyToOne('VendorPayment', 'allocations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_payment_id' })
  vendorPayment: any;

  @Column({ type: 'uuid', name: 'bill_id' })
  billId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

