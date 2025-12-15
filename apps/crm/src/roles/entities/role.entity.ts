import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/users.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Role, (role) => role.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Role | null;

  @OneToMany(() => Role, (role) => role.parent)
  children: Role[];

  @Column({ name: 'share_data_with_peers', default: false })
  shareDataWithPeers: boolean;

  @Column({ type: 'uuid', name: 'created_by_id', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

