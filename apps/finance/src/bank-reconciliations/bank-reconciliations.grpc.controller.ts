import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { BankReconciliationsService } from './bank-reconciliations.service';
import { CreateBankReconciliationDto } from './dto/create-bank-reconciliation.dto';
import { BankReconciliationPaginationDto } from './dto/pagination.dto';
import { MatchTransactionsDto } from './dto/match-transactions.dto';
import { CompleteReconciliationDto } from './dto/complete-reconciliation.dto';
import { BankReconciliationStatus } from './entities/bank-reconciliation.entity';

@Controller()
export class BankReconciliationsGrpcController {
  constructor(private readonly bankReconciliationsService: BankReconciliationsService) {}

  @GrpcMethod('BankReconciliationsService', 'GetBankReconciliations')
  async getBankReconciliations(data: { 
    sort?: string; 
    bank_account_id?: string; 
    status?: string;
  }) {
    try {
      const query: BankReconciliationPaginationDto = {
        sort: data.sort,
        bank_account_id: data.bank_account_id,
        status: data.status as BankReconciliationStatus,
      };

      const reconciliations = await this.bankReconciliationsService.findAll(query);
      return {
        bankReconciliations: reconciliations.map(reconciliation => this.mapReconciliationToProto(reconciliation)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get bank reconciliations',
      });
    }
  }

  @GrpcMethod('BankReconciliationsService', 'GetBankReconciliation')
  async getBankReconciliation(data: { id: string }) {
    try {
      const reconciliation = await this.bankReconciliationsService.findOne(data.id);
      return this.mapReconciliationToProto(reconciliation);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get bank reconciliation',
      });
    }
  }

  @GrpcMethod('BankReconciliationsService', 'CreateBankReconciliation')
  async createBankReconciliation(data: any) {
    try {
      console.log('BankReconciliationsGrpcController - CreateBankReconciliation received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        bankAccountId: data?.bankAccountId,
        bank_account_id: data?.bank_account_id,
      }, null, 2));

      const bankAccountId = data.bankAccountId || data.bank_account_id;
      if (!bankAccountId) {
        throw new BadRequestException('bank_account_id is required');
      }

      const createDto: CreateBankReconciliationDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        bank_account_id: bankAccountId,
        reconciliation_date: data.reconciliationDate || data.reconciliation_date,
        statement_balance: data.statementBalance !== undefined ? parseFloat(data.statementBalance.toString()) : undefined,
        outstanding_deposits: data.outstandingDeposits !== undefined ? parseFloat(data.outstandingDeposits.toString()) : undefined,
        outstanding_checks: data.outstandingChecks !== undefined ? parseFloat(data.outstandingChecks.toString()) : undefined,
        bank_charges: data.bankCharges !== undefined ? parseFloat(data.bankCharges.toString()) : undefined,
        interest_earned: data.interestEarned !== undefined ? parseFloat(data.interestEarned.toString()) : undefined,
        notes: data.notes || undefined,
      };

      const reconciliation = await this.bankReconciliationsService.create(createDto);
      return this.mapReconciliationToProto(reconciliation);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create bank reconciliation',
      });
    }
  }

  @GrpcMethod('BankReconciliationsService', 'GetUnmatchedTransactions')
  async getUnmatchedTransactions(data: { id: string }) {
    try {
      const result = await this.bankReconciliationsService.getUnmatched(data.id);
      return {
        reconciliationId: result.reconciliation_id,
        unmatchedTransactions: result.unmatched_transactions.map(t => ({
          transactionId: t.transaction_id,
          transactionDate: t.transaction_date,
          amount: t.amount.toString(),
          description: t.description,
          type: t.type,
        })),
        unmatchedStatementItems: result.unmatched_statement_items.map(item => ({
          date: item.date,
          amount: item.amount.toString(),
          description: item.description,
          type: item.type,
        })),
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get unmatched transactions',
      });
    }
  }

  @GrpcMethod('BankReconciliationsService', 'MatchTransactions')
  async matchTransactions(data: any) {
    try {
      const matchDto: MatchTransactionsDto = {
        reconciliation_id: data.reconciliationId || data.reconciliation_id,
        matches: (data.matches || []).map((m: any) => ({
          transaction_id: m.transactionId || m.transaction_id,
          statement_item_index: m.statementItemIndex !== undefined ? parseInt(m.statementItemIndex.toString()) : m.statement_item_index,
        })),
      };

      const reconciliation = await this.bankReconciliationsService.matchTransactions(matchDto);
      return this.mapReconciliationToProto(reconciliation);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to match transactions',
      });
    }
  }

  @GrpcMethod('BankReconciliationsService', 'CompleteReconciliation')
  async completeReconciliation(data: { id: string; notes?: string }) {
    try {
      const completeDto: CompleteReconciliationDto = {
        notes: data.notes,
      };
      const reconciliation = await this.bankReconciliationsService.complete(data.id, completeDto);
      return this.mapReconciliationToProto(reconciliation);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to complete reconciliation',
      });
    }
  }

  @GrpcMethod('BankReconciliationsService', 'DeleteBankReconciliation')
  async deleteBankReconciliation(data: { id: string }) {
    try {
      await this.bankReconciliationsService.remove(data.id);
      return { success: true, message: 'Bank reconciliation deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete bank reconciliation',
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

  private mapReconciliationToProto(reconciliation: any) {
    return {
      id: reconciliation.id,
      organizationId: reconciliation.organizationId || '',
      bankAccountId: reconciliation.bankAccountId || '',
      bankAccountName: reconciliation.bankAccountName || '',
      reconciliationDate: this.formatDate(reconciliation.reconciliationDate),
      statementBalance: reconciliation.statementBalance ? reconciliation.statementBalance.toString() : '0',
      bookBalance: reconciliation.bookBalance ? reconciliation.bookBalance.toString() : '0',
      adjustedBalance: reconciliation.adjustedBalance ? reconciliation.adjustedBalance.toString() : '0',
      status: reconciliation.status,
      outstandingDeposits: reconciliation.outstandingDeposits ? reconciliation.outstandingDeposits.toString() : '0',
      outstandingChecks: reconciliation.outstandingChecks ? reconciliation.outstandingChecks.toString() : '0',
      bankCharges: reconciliation.bankCharges ? reconciliation.bankCharges.toString() : '0',
      interestEarned: reconciliation.interestEarned ? reconciliation.interestEarned.toString() : '0',
      notes: reconciliation.notes || '',
      createdDate: this.formatDateTime(reconciliation.createdDate),
      updatedAt: this.formatDateTime(reconciliation.updatedAt),
    };
  }
}

