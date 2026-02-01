import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export interface TemplateSection {
  title: string;
  weight: number;
}

@Entity('review_templates')
export class ReviewTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  sections: TemplateSection[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
