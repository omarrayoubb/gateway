import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('competency_assessments')
export class CompetencyAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'competency_id' })
  competencyId: string;

  @Column({ type: 'uuid', name: 'assessed_by' })
  assessedBy: string;

  @Column({ type: 'int' })
  level: number; // 1-4

  @Column({ type: 'date', name: 'assessment_date' })
  assessmentDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
