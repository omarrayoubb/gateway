import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    nullable: true,
    name: 'difficulty_level',
  })
  difficultyLevel: DifficultyLevel | null;

  @Column({ type: 'jsonb', nullable: true })
  courses: string[] | null; // Array of course IDs

  @Column({ type: 'boolean', default: false })
  mandatory: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
