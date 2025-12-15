import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('notes')
export class Note extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  note: string;

  @Column()
  noteOwner: string;

  @Column()
  relatedType: string; // ticket, request, estimate, work_order

  @Column('uuid')
  relatedId: string;
}

