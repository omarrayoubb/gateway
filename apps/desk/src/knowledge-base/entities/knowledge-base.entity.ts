import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('knowledge_base')
export class KnowledgeBase extends BaseEntity {
  @Column()
  title: string;

  @Column('text', { nullable: true })
  summary: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 'Draft' })
  status: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  helpful_count: number;
}

