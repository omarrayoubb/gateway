import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('cost_centers')
export class CostCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 100 })
  costCenterCode: string;

  @Column({ type: 'varchar', length: 255 })
  costCenterName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department: string | null;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => CostCenter, (costCenter) => costCenter.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: CostCenter | null;

  @OneToMany(() => CostCenter, (costCenter) => costCenter.parent)
  children: CostCenter[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentName: string | null;

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  managerName: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

