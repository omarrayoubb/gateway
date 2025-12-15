import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { DeliveryNoteItem } from './delivery-note-item.entity';

@Entity('delivery_notes')
export class DeliveryNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, name: 'dn_number' })
  dnNumber: string;

  @Column({ type: 'varchar', name: 'delivered_to' })
  deliveredTo: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', nullable: true, name: 'tax_card' })
  taxCard: string | null;

  @Column({ type: 'varchar', nullable: true })
  cr: string | null;

  @OneToMany(() => DeliveryNoteItem, (item) => item.deliveryNote, { cascade: true })
  items: DeliveryNoteItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

