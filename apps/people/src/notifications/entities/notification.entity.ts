import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  REQUEST_SUBMITTED = 'request_submitted',
  APPROVAL_REQUIRED = 'approval_required',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', nullable: true, name: 'related_entity_type' })
  relatedEntityType: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'related_entity_id' })
  relatedEntityId: string | null;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
