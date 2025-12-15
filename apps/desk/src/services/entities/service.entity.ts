import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  netPrice: number;
}

