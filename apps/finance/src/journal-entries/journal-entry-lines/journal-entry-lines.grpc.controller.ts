import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { JournalEntryLinesService } from './journal-entry-lines.service';
import { CreateJournalEntryLineDto } from './dto/create-journal-entry-line.dto';

@Controller()
export class JournalEntryLinesGrpcController {
  constructor(private readonly journalEntryLinesService: JournalEntryLinesService) {}

  @GrpcMethod('JournalEntryLinesService', 'GetJournalEntryLines')
  async getJournalEntryLines(data: { journal_entry_id: string }) {
    try {
      const lines = await this.journalEntryLinesService.findAll(data.journal_entry_id);
      return {
        lines: lines.map(line => this.mapLineToProto(line)),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get journal entry lines',
      });
    }
  }

  @GrpcMethod('JournalEntryLinesService', 'CreateJournalEntryLine')
  async createJournalEntryLine(data: any) {
    try {
      const createDto: CreateJournalEntryLineDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        journal_entry_id: data.journalEntryId || data.journal_entry_id,
        line_number: data.lineNumber || data.line_number,
        account_id: data.accountId || data.account_id,
        description: data.description || undefined,
        debit: data.debit ? parseFloat(data.debit) : undefined,
        credit: data.credit ? parseFloat(data.credit) : undefined,
      };

      const line = await this.journalEntryLinesService.create(createDto);
      return this.mapLineToProto(line);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create journal entry line',
      });
    }
  }

  @GrpcMethod('JournalEntryLinesService', 'DeleteJournalEntryLine')
  async deleteJournalEntryLine(data: { id: string }) {
    try {
      await this.journalEntryLinesService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete journal entry line',
      });
    }
  }

  private mapLineToProto(line: any): any {
    return {
      id: line.id,
      journalEntryId: line.journalEntryId,
      lineNumber: line.lineNumber,
      accountId: line.accountId,
      accountCode: line.accountCode || '',
      accountName: line.accountName || '',
      description: line.description || '',
      debit: line.debit.toString(),
      credit: line.credit.toString(),
    };
  }
}

