import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ServiceAppointment } from '../../service-appointments/entities/service-appointment.entity';

@Entity('service_reports')
export class ServiceReport extends BaseEntity {
  @Column('uuid')
  serviceAppointmentId: string;

  @ManyToOne(() => ServiceAppointment)
  @JoinColumn({ name: 'serviceAppointmentId' })
  serviceAppointment: ServiceAppointment;

  @Column({ type: 'timestamp' })
  reportDate: Date;

  @Column('text')
  description: string;
}

