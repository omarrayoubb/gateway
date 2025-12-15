import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { TicketClassification } from '../../common/enums/ticket-classification.enum';
import { TicketComment } from './ticket-comment.entity';
import { WorkOrder } from '../../work-orders/entities/work-order.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('tickets')
export class Ticket extends BaseEntity {
  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  subject: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketClassification,
    nullable: true,
  })
  classification: TicketClassification;

  @Column({ nullable: true })
  ticketOwner: string;

  @Column({ nullable: true })
  productName: string;

  @Column({ nullable: true })
  vendor: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  dateTime1: Date | null;

  @Column({ nullable: true })
  channel: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @OneToMany(() => TicketComment, (comment) => comment.ticket)
  comments: TicketComment[];

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.ticket)
  workOrders: WorkOrder[];

  @OneToMany(() => Activity, (activity) => activity.ticket)
  activities: Activity[];
}

