import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { WorkOrder } from './work-order.entity';
import { Service } from '../../services/entities/service.entity';
import { Tax } from '../../taxes/entities/tax.entity';

@Entity('work_order_services')
export class WorkOrderService {
  @PrimaryColumn('uuid')
  workOrderId: string;

  @PrimaryColumn('uuid')
  serviceId: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.workOrderServices)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

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

