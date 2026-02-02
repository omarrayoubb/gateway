import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export interface CompetencyLevel {
  level: number;
  description: string;
}

@Entity('competencies')
export class Competency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  levels: CompetencyLevel[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
