import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('employee_skills')
export class EmployeeSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'skill_id' })
  skillId: string;

  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.BEGINNER,
    name: 'proficiency_level',
  })
  proficiencyLevel: ProficiencyLevel;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'verified_by' })
  verifiedBy: string | null;

  @Column({ type: 'date', nullable: true, name: 'verified_date' })
  verifiedDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
