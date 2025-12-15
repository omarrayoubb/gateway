import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('parts')
export class Part extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}

