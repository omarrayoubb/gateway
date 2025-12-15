import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('field_agents')
export class FieldAgent extends BaseEntity {
  @Column()
  name: string;
}

