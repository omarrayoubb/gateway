import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Request } from './request.entity';

@Entity('request_notes')
export class RequestNote extends BaseEntity {
  @Column('uuid')
  requestId: string;

  @ManyToOne(() => Request, (request) => request.notes)
  @JoinColumn({ name: 'requestId' })
  request: Request;

  @Column()
  title: string;

  @Column('text')
  note: string;

  @Column()
  noteOwner: string;
}

