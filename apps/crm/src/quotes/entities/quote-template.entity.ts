import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quote_templates')
export class QuoteTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_name' })
  templateName: string;

  @Column({ name: 'template_file_url' })
  templateFileUrl: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'template_type', nullable: true })
  templateType: string; // Standard, RFQ, Proposal

  @Column({ type: 'simple-array', name: 'detected_variables', nullable: true })
  detectedVariables: string[];

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId: string;

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used', type: 'date', nullable: true })
  lastUsed: Date;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

