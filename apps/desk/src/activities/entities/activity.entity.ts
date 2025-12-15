import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ActivityAction } from '../../common/enums/activity-action.enum';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('activities')
export class Activity extends BaseEntity {
  @Column()
  entityType: string;

  @Column('uuid')
  entityId: string;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column()
  performedBy: string;

  @Column('jsonb', { nullable: true })
  changes: Record<string, any>;

  @Column('uuid', { nullable: true })
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.activities, { nullable: true })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;
}

