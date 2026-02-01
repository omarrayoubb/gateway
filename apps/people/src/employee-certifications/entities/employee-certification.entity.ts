import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('employee_certifications')
export class EmployeeCertification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'uuid', name: 'certification_id' })
  certificationId: string;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true, name: 'expiry_date' })
  expiryDate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'certificate_number' })
  certificateNumber: string | null;

  @Column({
    type: 'enum',
    enum: CertificationStatus,
    default: CertificationStatus.ACTIVE,
  })
  status: CertificationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
