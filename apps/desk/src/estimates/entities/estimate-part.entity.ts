import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Estimate } from './estimate.entity';
import { Part } from '../../parts/entities/part.entity';
import { Tax } from '../../taxes/entities/tax.entity';

@Entity('estimate_parts')
export class EstimatePart {
  @PrimaryColumn('uuid')
  estimateId: string;

  @PrimaryColumn('uuid')
  partId: string;

  @ManyToOne(() => Estimate, (estimate) => estimate.estimateParts)
  @JoinColumn({ name: 'estimateId' })
  estimate: Estimate;

  @ManyToOne(() => Part)
  @JoinColumn({ name: 'partId' })
  part: Part;

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

