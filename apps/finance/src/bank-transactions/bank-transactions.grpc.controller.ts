import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { BankTransactionsService } from './bank-transactions.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { BankTransactionPaginationDto } from './dto/pagination.dto';
import { ImportBankTransactionsDto } from './dto/import-bank-transactions.dto';
import { BankTransactionType } from './entities/bank-transaction.entity';

@Controller()
export class BankTransactionsGrpcController {
  constructor(private readonly bankTransactionsService: BankTransactionsService) {}

  @GrpcMethod('BankTransactionsService', 'GetBankTransactions')
  async getBankTransactions(data: { 
    sort?: string; 
    bank_account_id?: string; 
    category?: string; 
    date_from?: string; 
    date_to?: string;
  }) {
    try {
      const query: BankTransactionPaginationDto = {
        sort: data.sort,
        bank_account_id: data.bank_account_id,
        category: data.category,
        date_from: data.date_from,
        date_to: data.date_to,
      };

      const transactions = await this.bankTransactionsService.findAll(query);
      return {
        bankTransactions: transactions.map(transaction => this.mapTransactionToProto(transaction)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get bank transactions',
      });
    }
  }

  @GrpcMethod('BankTransactionsService', 'GetBankTransaction')
  async getBankTransaction(data: { id: string }) {
    try {
      const transaction = await this.bankTransactionsService.findOne(data.id);
      return this.mapTransactionToProto(transaction);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get bank transaction',
      });
    }
  }

  @GrpcMethod('BankTransactionsService', 'CreateBankTransaction')
  async createBankTransaction(data: any) {
    try {
      console.log('BankTransactionsGrpcController - CreateBankTransaction received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        bankAccountId: data?.bankAccountId,
        bank_account_id: data?.bank_account_id,
      }, null, 2));

      const bankAccountId = data.bankAccountId || data.bank_account_id;
      if (!bankAccountId) {
        throw new BadRequestException('bank_account_id is required');
      }

      const createDto: CreateBankTransactionDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        bank_account_id: bankAccountId,
        transaction_date: data.transactionDate || data.transaction_date,
        transaction_type: (data.transactionType || data.transaction_type) as BankTransactionType,
        amount: data.amount !== undefined ? parseFloat(data.amount.toString()) : undefined,
        currency: data.currency || 'USD',
        reference: data.reference || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
      };

      const transaction = await this.bankTransactionsService.create(createDto);
      return this.mapTransactionToProto(transaction);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create bank transaction',
      });
    }
  }

  @GrpcMethod('BankTransactionsService', 'ImportBankTransactions')
  async importBankTransactions(data: any) {
    try {
      const bankAccountId = data.bankAccountId || data.bank_account_id;
      if (!bankAccountId) {
        throw new BadRequestException('bank_account_id is required');
      }
      if (!data.file_url && !data.fileUrl) {
        throw new BadRequestException('file_url is required');
      }
      if (!data.file_format && !data.fileFormat) {
        throw new BadRequestException('file_format is required');
      }

      const importDto: ImportBankTransactionsDto = {
        bank_account_id: bankAccountId,
        file_url: data.fileUrl || data.file_url,
        file_format: (data.fileFormat || data.file_format) as any,
        mapping: data.mapping || undefined,
      };

      const result = await this.bankTransactionsService.importTransactions(importDto);
      return {
        success: result.success,
        importedCount: result.imported_count,
        errors: result.errors,
        transactions: result.transactions.map(t => this.mapTransactionToProto(t)),
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to import bank transactions',
      });
    }
  }

  @GrpcMethod('BankTransactionsService', 'DeleteBankTransaction')
  async deleteBankTransaction(data: { id: string }) {
    try {
      await this.bankTransactionsService.remove(data.id);
      return { success: true, message: 'Bank transaction deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete bank transaction',
      });
    }
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString().split('T')[0];
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  private formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString();
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return '';
  }

  private mapTransactionToProto(transaction: any) {
    return {
      id: transaction.id,
      organizationId: transaction.organizationId || '',
      bankAccountId: transaction.bankAccountId || '',
      bankAccountName: transaction.bankAccountName || '',
      transactionDate: this.formatDate(transaction.transactionDate),
      transactionType: transaction.transactionType,
      amount: transaction.amount ? transaction.amount.toString() : '0',
      currency: transaction.currency || 'USD',
      reference: transaction.reference || '',
      description: transaction.description || '',
      category: transaction.category || '',
      isReconciled: transaction.isReconciled !== undefined ? transaction.isReconciled : false,
      reconciliationId: transaction.reconciliationId || '',
      createdDate: this.formatDateTime(transaction.createdDate),
      updatedAt: this.formatDateTime(transaction.updatedAt),
    };
  }
}

