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
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, name: 'po_number' })
  poNumber: string;

  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'date', name: 'order_date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true, name: 'expected_delivery_date' })
  expectedDeliveryDate: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT,
  })
  status: PurchaseOrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Approval fields
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    nullable: true,
    name: 'approval_status',
  })
  approvalStatus: ApprovalStatus | null;

  @Column({ type: 'boolean', default: false, name: 'requires_approval' })
  requiresApproval: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'submitted_for_approval_by' })
  submittedForApprovalBy: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'submitted_for_approval_at' })
  submittedForApprovalAt: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'approved_by' })
  approvedBy: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, { cascade: true })
  items: PurchaseOrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

