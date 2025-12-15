import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('time_sheets')
export class TimeSheet extends BaseEntity {
  @Column()
  serviceResource: string;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column('int')
  duration: number; // in minutes

  @Column('uuid')
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;
}

