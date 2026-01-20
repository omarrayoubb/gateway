import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { CreateJournalEntryLineDto } from './dto/create-journal-entry-line.dto';
import { Account } from '../../accounts/entities/account.entity';
import { JournalEntry } from '../entities/journal-entry.entity';

@Injectable()
export class JournalEntryLinesService {
  constructor(
    @InjectRepository(JournalEntryLine)
    private readonly journalEntryLineRepository: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
  ) {}

  async findAll(journalEntryId: string): Promise<JournalEntryLine[]> {
    const entry = await this.journalEntryRepository.findOne({
      where: { id: journalEntryId },
    });

    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${journalEntryId} not found`);
    }

    return await this.journalEntryLineRepository.find({
      where: { journalEntryId },
      order: { lineNumber: 'ASC' },
    });
  }

  async create(createLineDto: CreateJournalEntryLineDto): Promise<JournalEntryLine> {
    try {
      if (!createLineDto.journal_entry_id) {
        throw new BadRequestException('journal_entry_id is required');
      }
      if (!createLineDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      const entry = await this.journalEntryRepository.findOne({
        where: { id: createLineDto.journal_entry_id },
      });

      if (!entry) {
        throw new NotFoundException(`Journal entry with ID ${createLineDto.journal_entry_id} not found`);
      }

      if (entry.status === 'posted') {
        throw new BadRequestException('Cannot add lines to a posted journal entry');
      }

      if (entry.status === 'void') {
        throw new BadRequestException('Cannot add lines to a void journal entry');
      }

      const account = await this.accountRepository.findOne({
        where: { id: createLineDto.account_id },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${createLineDto.account_id} not found`);
      }

      const debit = createLineDto.debit || 0;
      const credit = createLineDto.credit || 0;

      if (debit < 0 || credit < 0) {
        throw new BadRequestException('Debit and credit amounts must be non-negative');
      }

      if (debit > 0 && credit > 0) {
        throw new BadRequestException('A line cannot have both debit and credit amounts');
      }

      const line = this.journalEntryLineRepository.create({
        journalEntryId: createLineDto.journal_entry_id,
        lineNumber: createLineDto.line_number || (await this.getNextLineNumber(createLineDto.journal_entry_id)),
        accountId: createLineDto.account_id,
        accountCode: account.accountCode,
        accountName: account.accountName,
        description: createLineDto.description || null,
        debit: debit,
        credit: credit,
      });

      const savedLine = await this.journalEntryLineRepository.save(line);

      // Recalculate entry totals
      await this.recalculateEntryTotals(createLineDto.journal_entry_id);

      return savedLine;
    } catch (error) {
      console.error('Error in JournalEntryLinesService.create:', error);
      throw error;
    }
  }

  private async getNextLineNumber(journalEntryId: string): Promise<number> {
    const lastLine = await this.journalEntryLineRepository.findOne({
      where: { journalEntryId },
      order: { lineNumber: 'DESC' },
    });

    return lastLine ? lastLine.lineNumber + 1 : 1;
  }

  private async recalculateEntryTotals(journalEntryId: string): Promise<void> {
    const lines = await this.journalEntryLineRepository.find({
      where: { journalEntryId },
    });

    const totalDebit = lines.reduce((sum, line) => sum + parseFloat(line.debit.toString()), 0);
    const totalCredit = lines.reduce((sum, line) => sum + parseFloat(line.credit.toString()), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    await this.journalEntryRepository.update(journalEntryId, {
      totalDebit: totalDebit,
      totalCredit: totalCredit,
      isBalanced: isBalanced,
    });
  }

  async remove(id: string): Promise<void> {
    const line = await this.journalEntryLineRepository.findOne({
      where: { id },
    });

    if (!line) {
      throw new NotFoundException(`Journal entry line with ID ${id} not found`);
    }

    const entry = await this.journalEntryRepository.findOne({
      where: { id: line.journalEntryId },
    });

    if (entry && entry.status === 'posted') {
      throw new BadRequestException('Cannot delete lines from a posted journal entry');
    }

    await this.journalEntryLineRepository.remove(line);

    // Recalculate entry totals
    await this.recalculateEntryTotals(line.journalEntryId);
  }
}

