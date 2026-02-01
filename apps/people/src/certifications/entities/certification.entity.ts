import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'issuing_organization' })
  issuingOrganization: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'int', nullable: true, name: 'validity_period_months' })
  validityPeriodMonths: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number | null;

  @Column({ type: 'boolean', default: false })
  mandatory: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
