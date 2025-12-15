import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('knowledge_base')
export class KnowledgeBase extends BaseEntity {
  @Column()
  articleTitle: string;

  @Column()
  category: string;

  @Column()
  status: string;

  @Column('text')
  content: string;

  @Column()
  author: string;
}

