import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { EntryType, JournalEntryStatus } from './entities/journal-entry.entity';

@Controller()
export class JournalEntriesGrpcController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @GrpcMethod('JournalEntriesService', 'GetJournalEntry')
  async getJournalEntry(data: { id: string }) {
    try {
      const entry = await this.journalEntriesService.findOne(data.id);
      return this.mapJournalEntryToProto(entry);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get journal entry',
      });
    }
  }

  @GrpcMethod('JournalEntriesService', 'GetJournalEntries')
  async getJournalEntries(data: {
    limit?: number;
    sort?: string;
    entry_type?: string;
    status?: string;
  }) {
    try {
      const entries = await this.journalEntriesService.findAll({
        limit: data.limit,
        sort: data.sort,
        entry_type: data.entry_type as EntryType,
        status: data.status as JournalEntryStatus,
      });

      return {
        entries: entries.map(entry => this.mapJournalEntryToProto(entry)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get journal entries',
      });
    }
  }

  @GrpcMethod('JournalEntriesService', 'CreateJournalEntry')
  async createJournalEntry(data: any) {
    try {
      const createDto: CreateJournalEntryDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        entry_number: data.entryNumber || data.entry_number,
        entry_date: data.entryDate || data.entry_date,
        entry_type: (data.entryType || data.entry_type) as EntryType,
        reference: data.reference || undefined,
        description: data.description,
        status: data.status ? (data.status as JournalEntryStatus) : undefined,
        notes: data.notes || undefined,
        lines: data.lines ? data.lines.map((line: any) => ({
          account_id: line.accountId || line.account_id,
          line_number: line.lineNumber || line.line_number,
          description: line.description,
          debit: line.debit ? parseFloat(line.debit) : undefined,
          credit: line.credit ? parseFloat(line.credit) : undefined,
        })) : undefined,
      };

      const entry = await this.journalEntriesService.create(createDto);
      return this.mapJournalEntryToProto(entry);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create journal entry',
      });
    }
  }

  @GrpcMethod('JournalEntriesService', 'UpdateJournalEntry')
  async updateJournalEntry(data: any) {
    try {
      const updateDto: UpdateJournalEntryDto = {
        organization_id: data.organizationId || data.organization_id,
        entry_number: data.entryNumber || data.entry_number,
        entry_date: data.entryDate || data.entry_date,
        entry_type: data.entryType ? (data.entryType as EntryType) : undefined,
        reference: data.reference,
        description: data.description,
        status: data.status ? (data.status as JournalEntryStatus) : undefined,
        notes: data.notes,
        lines: data.lines ? data.lines.map((line: any) => ({
          account_id: line.accountId || line.account_id,
          line_number: line.lineNumber || line.line_number,
          description: line.description,
          debit: line.debit ? parseFloat(line.debit) : undefined,
          credit: line.credit ? parseFloat(line.credit) : undefined,
        })) : undefined,
      };

      const entry = await this.journalEntriesService.update(data.id, updateDto);
      return this.mapJournalEntryToProto(entry);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update journal entry',
      });
    }
  }

  @GrpcMethod('JournalEntriesService', 'PostJournalEntry')
  async postJournalEntry(data: { id: string }) {
    try {
      const entry = await this.journalEntriesService.post(data.id);
      return this.mapJournalEntryToProto(entry);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to post journal entry',
      });
    }
  }

  @GrpcMethod('JournalEntriesService', 'VoidJournalEntry')
  async voidJournalEntry(data: { id: string; reason?: string }) {
    try {
      const entry = await this.journalEntriesService.void(data.id, data.reason);
      return this.mapJournalEntryToProto(entry);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to void journal entry',
      });
    }
  }

  @GrpcMethod('JournalEntriesService', 'DeleteJournalEntry')
  async deleteJournalEntry(data: { id: string }) {
    try {
      await this.journalEntriesService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete journal entry',
      });
    }
  }

  private mapJournalEntryToProto(entry: any): any {
    // Handle date - could be Date object or string
    let entryDate: string;
    if (entry.entryDate instanceof Date) {
      entryDate = entry.entryDate.toISOString().split('T')[0];
    } else if (typeof entry.entryDate === 'string') {
      entryDate = entry.entryDate.split('T')[0];
    } else {
      entryDate = '';
    }

    return {
      id: entry.id,
      organizationId: entry.organizationId || '',
      entryNumber: entry.entryNumber,
      entryDate: entryDate,
      entryType: entry.entryType,
      reference: entry.reference || '',
      description: entry.description,
      status: entry.status,
      totalDebit: entry.totalDebit ? entry.totalDebit.toString() : '0',
      totalCredit: entry.totalCredit ? entry.totalCredit.toString() : '0',
      isBalanced: entry.isBalanced !== undefined ? entry.isBalanced : false,
      notes: entry.notes || '',
      lines: entry.lines ? entry.lines.map((line: any) => ({
        id: line.id,
        journalEntryId: line.journalEntryId,
        lineNumber: line.lineNumber,
        accountId: line.accountId,
        accountCode: line.accountCode || '',
        accountName: line.accountName || '',
        description: line.description || '',
        debit: line.debit ? line.debit.toString() : '0',
        credit: line.credit ? line.credit.toString() : '0',
      })) : [],
    };
  }
}

