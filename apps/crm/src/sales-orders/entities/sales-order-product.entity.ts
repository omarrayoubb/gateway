import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesOrder } from './sales-order.entity';

@Entity('sales_order_products')
export class SalesOrderProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'sales_order_id' })
  salesOrderId: string;

  @ManyToOne(() => SalesOrder, (order) => order.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder: SalesOrder;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'numeric', precision: 19, scale: 4, name: 'list_price' })
  listPrice: number;

  @Column({ type: 'numeric', precision: 19, scale: 4 })
  quantity: number;

  @Column({ type: 'numeric', precision: 19, scale: 4 })
  amount: number;

  @Column({ type: 'numeric', precision: 19, scale: 4, nullable: true })
  discount: number | null;

  @Column({ type: 'numeric', precision: 19, scale: 4, nullable: true })
  tax: number | null;

  @Column({ type: 'numeric', precision: 19, scale: 4 })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

