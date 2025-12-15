import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ScheduleFrequency } from '../../common/enums/schedule-frequency.enum';

@Entity('schedule_maintenance')
export class ScheduleMaintenance extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ScheduleFrequency,
  })
  schedule: ScheduleFrequency;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column()
  relatedEntityType: string;

  @Column('uuid')
  relatedId: string;
}

