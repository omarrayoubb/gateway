import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { BillingStatus } from '../../common/enums/billing-status.enum';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Request } from '../../requests/entities/request.entity';
import { ServiceAppointment } from '../../service-appointments/entities/service-appointment.entity';
import { WorkOrderService } from './work-order-service.entity';
import { WorkOrderPart } from './work-order-part.entity';
import { Part } from '../../parts/entities/part.entity';

@Entity('work_orders')
export class WorkOrder extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ nullable: true })
  agent: string;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @Column({ nullable: true })
  currency: string;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  exchangeRate: number;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column('jsonb', { nullable: true })
  serviceAddress: Record<string, any>;

  @Column('jsonb', { nullable: true })
  billingAddress: Record<string, any>;

  @Column('text', { nullable: true })
  termsAndConditions: string;

  @Column({
    type: 'enum',
    enum: BillingStatus,
    default: BillingStatus.PENDING,
  })
  billingStatus: BillingStatus;

  @Column('uuid', { nullable: true })
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.workOrders, { nullable: true })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column('uuid', { nullable: true })
  installationBaseId: string;

  @ManyToOne(() => Part, { nullable: true })
  @JoinColumn({ name: 'installationBaseId' })
  installationBase: Part;

  @Column('uuid', { nullable: true })
  parentWorkOrderId: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.childWorkOrders, { nullable: true })
  @JoinColumn({ name: 'parentWorkOrderId' })
  parentWorkOrder: WorkOrder;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.parentWorkOrder)
  childWorkOrders: WorkOrder[];

  @Column('uuid', { nullable: true })
  requestId: string;

  @ManyToOne(() => Request, { nullable: true })
  @JoinColumn({ name: 'requestId' })
  request: Request;

  @OneToMany(() => ServiceAppointment, (appointment) => appointment.workOrder)
  serviceAppointments: ServiceAppointment[];

  @OneToMany(() => WorkOrderService, (workOrderService) => workOrderService.workOrder)
  workOrderServices: WorkOrderService[];

  @OneToMany(() => WorkOrderPart, (workOrderPart) => workOrderPart.workOrder)
  workOrderParts: WorkOrderPart[];

  @Column({ nullable: true })
  createdBy: string;
}

