import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { WorkOrder } from './work-order.entity';
import { Part } from '../../parts/entities/part.entity';
import { Tax } from '../../taxes/entities/tax.entity';

@Entity('work_order_parts')
export class WorkOrderPart {
  @PrimaryColumn('uuid')
  workOrderId: string;

  @PrimaryColumn('uuid')
  partId: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.workOrderParts)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @ManyToOne(() => Part)
  @JoinColumn({ name: 'partId' })
  part: Part;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('uuid', { nullable: true })
  taxId: string;

  @ManyToOne(() => Tax, { nullable: true })
  @JoinColumn({ name: 'taxId' })
  tax: Tax;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
}

