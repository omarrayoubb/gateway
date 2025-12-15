import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { WorkOrder } from '../../work-orders/entities/work-order.entity';

@Entity('service_appointments')
export class ServiceAppointment extends BaseEntity {
  @Column('uuid')
  workOrderId: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.serviceAppointments)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'time' })
  scheduledTime: string;

  @Column()
  status: string;

  @Column()
  assignedAgent: string;
}

