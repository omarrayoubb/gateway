import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { JournalEntryLine } from '../journal-entry-lines/entities/journal-entry-line.entity';

export enum EntryType {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  ADJUSTMENT = 'adjustment',
  CLOSING = 'closing',
}

export enum JournalEntryStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  VOID = 'void',
}

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string | null;

  @Column({ type: 'varchar', unique: true, name: 'entry_number' })
  entryNumber: string;

  @Column({ type: 'date', name: 'entry_date' })
  entryDate: Date;

  @Column({
    type: 'enum',
    enum: EntryType,
    name: 'entry_type',
  })
  entryType: EntryType;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: JournalEntryStatus,
    default: JournalEntryStatus.DRAFT,
  })
  status: JournalEntryStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_debit' })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, name: 'total_credit' })
  totalCredit: number;

  @Column({ type: 'boolean', default: false, name: 'is_balanced' })
  isBalanced: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => JournalEntryLine, (line) => line.journalEntry, { cascade: true })
  lines: JournalEntryLine[];

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

