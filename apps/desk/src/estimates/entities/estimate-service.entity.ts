import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Estimate } from './estimate.entity';
import { Service } from '../../services/entities/service.entity';
import { Tax } from '../../taxes/entities/tax.entity';

@Entity('estimate_services')
export class EstimateService {
  @PrimaryColumn('uuid')
  estimateId: string;

  @PrimaryColumn('uuid')
  serviceId: string;

  @ManyToOne(() => Estimate, (estimate) => estimate.estimateServices)
  @JoinColumn({ name: 'estimateId' })
  estimate: Estimate;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('uuid', { nullable: true })
  taxId: string;

  @ManyToOne(() => Tax, { nullable: true })
  @JoinColumn({ name: 'taxId' })
  tax: Tax;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
}

