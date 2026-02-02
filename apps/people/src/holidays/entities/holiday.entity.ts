import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'boolean', default: false, name: 'is_optional' })
  isOptional: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

