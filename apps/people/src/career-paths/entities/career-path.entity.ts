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

export interface CareerPathMilestone {
  title: string;
  duration_months: number;
}

@Entity('career_paths')
export class CareerPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'starting_role' })
  startingRole: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'target_role' })
  targetRole: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string | null;

  @Column({ type: 'int', nullable: true, name: 'estimated_duration_years' })
  estimatedDurationYears: number | null;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    nullable: true,
    name: 'difficulty_level',
  })
  difficultyLevel: DifficultyLevel | null;

  @Column({ type: 'jsonb', nullable: true, name: 'required_skills' })
  requiredSkills: string[] | null; // Array of skill IDs

  @Column({ type: 'jsonb', nullable: true, name: 'required_competencies' })
  requiredCompetencies: string[] | null; // Array of competency IDs

  @Column({ type: 'jsonb', nullable: true })
  milestones: CareerPathMilestone[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
