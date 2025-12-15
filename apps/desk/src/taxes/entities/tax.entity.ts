import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('taxes')
export class Tax extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number;
}

