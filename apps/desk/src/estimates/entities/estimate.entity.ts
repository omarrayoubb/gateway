import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { EstimateService } from './estimate-service.entity';
import { EstimatePart } from './estimate-part.entity';
import { WorkOrder } from '../../work-orders/entities/work-order.entity';
import { Request } from '../../requests/entities/request.entity';

@Entity('estimates')
export class Estimate extends BaseEntity {
  @Column()
  summary: string;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column()
  currency: string;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  exchangeRate: number;

  @Column()
  company: string;

  @Column()
  contact: string;

  @Column()
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

  @Column('uuid', { nullable: true })
  parentWorkOrderId: string;

  @ManyToOne(() => WorkOrder, { nullable: true })
  @JoinColumn({ name: 'parentWorkOrderId' })
  parentWorkOrder: WorkOrder;

  @Column('uuid', { nullable: true })
  requestId: string;

  @ManyToOne(() => Request, { nullable: true })
  @JoinColumn({ name: 'requestId' })
  request: Request;

  @OneToMany(() => EstimateService, (estimateService) => estimateService.estimate)
  estimateServices: EstimateService[];

  @OneToMany(() => EstimatePart, (estimatePart) => estimatePart.estimate)
  estimateParts: EstimatePart[];

  @Column()
  createdBy: string;
}

