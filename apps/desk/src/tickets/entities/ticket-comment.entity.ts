import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ticket } from './ticket.entity';

@Entity('ticket_comments')
export class TicketComment extends BaseEntity {
  @Column('uuid')
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.comments)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column('text')
  comment: string;

  @Column()
  author: string;
}

