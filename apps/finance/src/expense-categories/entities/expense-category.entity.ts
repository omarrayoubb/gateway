import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', name: 'category_code' })
  categoryCode: string;

  @Column({ type: 'varchar', name: 'category_name' })
  categoryName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'account_id' })
  accountId: string | null;

  @Column({ type: 'boolean', default: false, name: 'requires_receipt' })
  requiresReceipt: boolean;

  @Column({ type: 'boolean', default: false, name: 'requires_approval' })
  requiresApproval: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true, name: 'approval_limit' })
  approvalLimit: number | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

