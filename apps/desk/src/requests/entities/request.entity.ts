import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { RequestNote } from './request-note.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('requests')
export class Request extends BaseEntity {
  @Column()
  summary: string;

  @Column()
  status: string;

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

  @Column({ type: 'timestamp', nullable: true })
  preferredDate1: Date;

  @Column({ type: 'timestamp', nullable: true })
  preferredDate2: Date;

  @Column({ type: 'time', nullable: true })
  preferredTime: string;

  @Column('text', { nullable: true })
  preferredNotes: string;

  @Column({ nullable: true })
  territory: string;

  @Column('uuid', { nullable: true })
  ticketId: string;

  @ManyToOne(() => Ticket, { nullable: true })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @OneToMany(() => RequestNote, (note) => note.request)
  notes: RequestNote[];

  @Column()
  createdBy: string;
}

