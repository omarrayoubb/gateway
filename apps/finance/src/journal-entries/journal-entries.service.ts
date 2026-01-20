import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JournalEntry, EntryType, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalEntryLine } from './journal-entry-lines/entities/journal-entry-line.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { JournalEntryPaginationDto } from './dto/pagination.dto';
import { Account } from '../accounts/entities/account.entity';
import { GeneralLedgerService } from '../general-ledger/general-ledger.service';

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly journalEntryLineRepository: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @Inject(forwardRef(() => GeneralLedgerService))
    private readonly generalLedgerService: GeneralLedgerService,
  ) {}

  async create(createJournalEntryDto: CreateJournalEntryDto): Promise<JournalEntry> {
    try {
      // Validate required fields
      if (!createJournalEntryDto.entry_number) {
        throw new BadRequestException('entry_number is required');
      }
      if (!createJournalEntryDto.entry_date) {
        throw new BadRequestException('entry_date is required');
      }
      if (!createJournalEntryDto.entry_type) {
        throw new BadRequestException('entry_type is required');
      }
      if (!createJournalEntryDto.description) {
        throw new BadRequestException('description is required');
      }

      const organizationId = createJournalEntryDto.organization_id || null;

      // Check for duplicate entry number
      const existingEntry = await this.journalEntryRepository.findOne({
        where: {
          entryNumber: createJournalEntryDto.entry_number,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });

      if (existingEntry) {
        throw new BadRequestException(`Journal entry with number ${createJournalEntryDto.entry_number} already exists`);
      }

      // Calculate totals from lines
      let totalDebit = 0;
      let totalCredit = 0;

      if (createJournalEntryDto.lines && createJournalEntryDto.lines.length > 0) {
        for (let i = 0; i < createJournalEntryDto.lines.length; i++) {
          const lineDto = createJournalEntryDto.lines[i];
          
          // Fetch account details
          const account = await this.accountRepository.findOne({
            where: { id: lineDto.account_id },
          });

          if (!account) {
            throw new BadRequestException(`Account with ID ${lineDto.account_id} not found`);
          }

          const debit = lineDto.debit || 0;
          const credit = lineDto.credit || 0;

          if (debit < 0 || credit < 0) {
            throw new BadRequestException('Debit and credit amounts must be non-negative');
          }

          if (debit > 0 && credit > 0) {
            throw new BadRequestException('A line cannot have both debit and credit amounts');
          }

          totalDebit += debit;
          totalCredit += credit;
        }
      }

      const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow small rounding differences

      if (!isBalanced && createJournalEntryDto.status === JournalEntryStatus.POSTED) {
        throw new BadRequestException('Journal entry must be balanced before posting');
      }

      // Create journal entry first
      const journalEntry = this.journalEntryRepository.create({
        organizationId: organizationId,
        entryNumber: createJournalEntryDto.entry_number,
        entryDate: new Date(createJournalEntryDto.entry_date),
        entryType: createJournalEntryDto.entry_type,
        reference: createJournalEntryDto.reference || null,
        description: createJournalEntryDto.description,
        status: createJournalEntryDto.status || JournalEntryStatus.DRAFT,
        totalDebit: totalDebit,
        totalCredit: totalCredit,
        isBalanced: isBalanced,
        notes: createJournalEntryDto.notes || null,
      });

      const savedEntry = await this.journalEntryRepository.save(journalEntry);

      // Now create lines with the proper journalEntryId
      if (createJournalEntryDto.lines && createJournalEntryDto.lines.length > 0) {
        const lines: JournalEntryLine[] = [];
        
        for (let i = 0; i < createJournalEntryDto.lines.length; i++) {
          const lineDto = createJournalEntryDto.lines[i];
          
          const account = await this.accountRepository.findOne({
            where: { id: lineDto.account_id },
          });

          if (!account) {
            throw new BadRequestException(`Account with ID ${lineDto.account_id} not found`);
          }

          const debit = lineDto.debit || 0;
          const credit = lineDto.credit || 0;

          const line = this.journalEntryLineRepository.create({
            journalEntryId: savedEntry.id,
            lineNumber: lineDto.line_number || i + 1,
            accountId: lineDto.account_id,
            accountCode: account.accountCode,
            accountName: account.accountName,
            description: lineDto.description || null,
            debit: debit,
            credit: credit,
          });

          lines.push(line);
        }

        await this.journalEntryLineRepository.save(lines);
      }

      return await this.findOne(savedEntry.id);
    } catch (error) {
      console.error('Error in JournalEntriesService.create:', error);
      throw error;
    }
  }

  async findAll(paginationQuery: JournalEntryPaginationDto): Promise<JournalEntry[]> {
    try {
      const { limit = 100, sort, entry_type, status } = paginationQuery;

      const queryBuilder = this.journalEntryRepository
        .createQueryBuilder('entry')
        .leftJoinAndSelect('entry.lines', 'lines');

      if (entry_type) {
        queryBuilder.where('entry.entryType = :entryType', { entryType: entry_type });
      }

      if (status) {
        const whereCondition = entry_type ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('entry.status = :status', { status });
      }

      if (sort) {
        let sortField = sort;
        let sortOrder: 'ASC' | 'DESC' = 'ASC';
        
        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1);
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field;
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }
        
        // Map snake_case to camelCase for entity fields
        const fieldMap: { [key: string]: string } = {
          'entry_date': 'entryDate',
          'entry_number': 'entryNumber',
          'entry_type': 'entryType',
          'total_debit': 'totalDebit',
          'total_credit': 'totalCredit',
          'is_balanced': 'isBalanced',
          'organization_id': 'organizationId',
          'created_date': 'createdDate',
        };
        
        const entityField = fieldMap[sortField] || sortField;
        
        if (entityField && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`entry.${entityField}`, sortOrder);
          } catch (error) {
            // Fallback to default sort if field doesn't exist
            queryBuilder.orderBy('entry.entryDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('entry.entryDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('entry.entryDate', 'DESC');
      }

      if (limit) {
        queryBuilder.take(limit);
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in JournalEntriesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<JournalEntry> {
    const entry = await this.journalEntryRepository.findOne({
      where: { id },
      relations: ['lines'],
    });
    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }
    return entry;
  }

  async update(id: string, updateJournalEntryDto: UpdateJournalEntryDto): Promise<JournalEntry> {
    const entry = await this.findOne(id);

    if (entry.status === JournalEntryStatus.POSTED) {
      throw new BadRequestException('Cannot update a posted journal entry');
    }

    if (entry.status === JournalEntryStatus.VOID) {
      throw new BadRequestException('Cannot update a void journal entry');
    }

    // Update entry fields
    if (updateJournalEntryDto.entry_number !== undefined) entry.entryNumber = updateJournalEntryDto.entry_number;
    if (updateJournalEntryDto.entry_date !== undefined) entry.entryDate = new Date(updateJournalEntryDto.entry_date);
    if (updateJournalEntryDto.entry_type !== undefined) entry.entryType = updateJournalEntryDto.entry_type;
    if (updateJournalEntryDto.reference !== undefined) entry.reference = updateJournalEntryDto.reference;
    if (updateJournalEntryDto.description !== undefined) entry.description = updateJournalEntryDto.description;
    if (updateJournalEntryDto.status !== undefined) entry.status = updateJournalEntryDto.status;
    if (updateJournalEntryDto.notes !== undefined) entry.notes = updateJournalEntryDto.notes;

    // If lines are updated, recalculate totals
    if (updateJournalEntryDto.lines && updateJournalEntryDto.lines.length > 0) {
      // Delete existing lines
      await this.journalEntryLineRepository.delete({ journalEntryId: id });

      // Create new lines
      let totalDebit = 0;
      let totalCredit = 0;
      const lines: JournalEntryLine[] = [];

      for (let i = 0; i < updateJournalEntryDto.lines.length; i++) {
        const lineDto = updateJournalEntryDto.lines[i];
        
        const account = await this.accountRepository.findOne({
          where: { id: lineDto.account_id },
        });

        if (!account) {
          throw new BadRequestException(`Account with ID ${lineDto.account_id} not found`);
        }

        const debit = lineDto.debit || 0;
        const credit = lineDto.credit || 0;

        if (debit < 0 || credit < 0) {
          throw new BadRequestException('Debit and credit amounts must be non-negative');
        }

        if (debit > 0 && credit > 0) {
          throw new BadRequestException('A line cannot have both debit and credit amounts');
        }

        totalDebit += debit;
        totalCredit += credit;

        const line = this.journalEntryLineRepository.create({
          journalEntryId: id,
          lineNumber: lineDto.line_number || i + 1,
          accountId: lineDto.account_id,
          accountCode: account.accountCode,
          accountName: account.accountName,
          description: lineDto.description || null,
          debit: debit,
          credit: credit,
        });

        lines.push(line);
      }

      await this.journalEntryLineRepository.save(lines);

      entry.totalDebit = totalDebit;
      entry.totalCredit = totalCredit;
      entry.isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    }

    await this.journalEntryRepository.save(entry);
    return await this.findOne(id);
  }

  async post(id: string): Promise<JournalEntry> {
    const entry = await this.findOne(id);

    if (entry.status === JournalEntryStatus.POSTED) {
      throw new BadRequestException('Journal entry is already posted');
    }

    if (entry.status === JournalEntryStatus.VOID) {
      throw new BadRequestException('Cannot post a void journal entry');
    }

    // Recalculate totals from lines to ensure accuracy
    if (!entry.lines || entry.lines.length === 0) {
      throw new BadRequestException('Journal entry must have at least one line before posting');
    }

    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of entry.lines) {
      const debit = typeof line.debit === 'number' ? line.debit : parseFloat(String(line.debit || '0'));
      const credit = typeof line.credit === 'number' ? line.credit : parseFloat(String(line.credit || '0'));
      totalDebit += debit;
      totalCredit += credit;
    }

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow small rounding differences

    // Update the entry with recalculated totals
    entry.totalDebit = totalDebit;
    entry.totalCredit = totalCredit;
    entry.isBalanced = isBalanced;

    if (!isBalanced) {
      const difference = Math.abs(totalDebit - totalCredit);
      throw new BadRequestException(
        `Journal entry must be balanced before posting. Debits: ${totalDebit.toFixed(2)}, Credits: ${totalCredit.toFixed(2)}, Difference: ${difference.toFixed(2)}`
      );
    }

    entry.status = JournalEntryStatus.POSTED;
    const savedEntry = await this.journalEntryRepository.save(entry);

    // Sync to general ledger when posted
    try {
      const entryDate = entry.entryDate || new Date();
      if (!entry.entryDate) {
        console.warn(`Journal entry ${entry.id} has no entry date. Using current date for ledger sync.`);
      }
      await this.generalLedgerService.syncJournalEntryToLedger(entry.id, entryDate);
    } catch (error) {
      console.error('Error syncing journal entry to general ledger:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        journalEntryId: entry.id,
        entryDate: entry.entryDate,
      });
      // Don't fail the post operation if ledger sync fails
    }

    // Try to reload the entry, but if it fails, return the saved entry
    try {
      return await this.findOne(id);
    } catch (error) {
      console.warn(`Could not reload journal entry ${id} after posting. Returning saved entry.`, error);
      // Return the entry we just saved, but ensure it has the lines relation
      if (savedEntry.lines) {
        return savedEntry;
      }
      // If no lines, try to load them
      const entryWithLines = await this.journalEntryRepository.findOne({
        where: { id: savedEntry.id },
        relations: ['lines'],
      });
      return entryWithLines || savedEntry;
    }
  }

  async void(id: string, reason?: string): Promise<JournalEntry> {
    const entry = await this.findOne(id);

    if (entry.status === JournalEntryStatus.VOID) {
      throw new BadRequestException('Journal entry is already void');
    }

    entry.status = JournalEntryStatus.VOID;
    if (reason) {
      entry.notes = entry.notes ? `${entry.notes}\nVoided: ${reason}` : `Voided: ${reason}`;
    }
    await this.journalEntryRepository.save(entry);

    // Remove from general ledger when voided
    try {
      await this.generalLedgerService.removeJournalEntryFromLedger(entry.id);
    } catch (error) {
      console.error('Error removing journal entry from general ledger:', error);
      // Don't fail the void operation if ledger removal fails
    }

    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    
    if (entry.status === JournalEntryStatus.POSTED) {
      throw new BadRequestException('Cannot delete a posted journal entry');
    }

    // Remove from general ledger when deleted (if it was synced)
    try {
      await this.generalLedgerService.removeJournalEntryFromLedger(entry.id);
    } catch (error) {
      console.error('Error removing journal entry from general ledger:', error);
      // Don't fail the delete operation if ledger removal fails
    }

    await this.journalEntryRepository.remove(entry);
  }
}

