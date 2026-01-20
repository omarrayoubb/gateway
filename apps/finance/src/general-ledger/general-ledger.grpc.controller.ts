import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GeneralLedgerService } from './general-ledger.service';
import { GeneralLedgerQueryDto, GeneralLedgerAccountQueryDto, GeneralLedgerReportQueryDto } from './dto/general-ledger-query.dto';

@Controller()
export class GeneralLedgerGrpcController {
  constructor(private readonly generalLedgerService: GeneralLedgerService) {}

  @GrpcMethod('GeneralLedgerService', 'GetGeneralLedger')
  async getGeneralLedger(data: {
    account_id?: string;
    period_start?: string;
    period_end?: string;
    sort?: string;
  }) {
    try {
      const query: GeneralLedgerQueryDto = {
        account_id: data.account_id,
        period_start: data.period_start,
        period_end: data.period_end,
        sort: data.sort,
      };

      const entries = await this.generalLedgerService.findAll(query);
      return {
        entries: entries.map(entry => this.mapLedgerEntryToProto(entry)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get general ledger',
      });
    }
  }

  @GrpcMethod('GeneralLedgerService', 'GetAccountLedger')
  async getAccountLedger(data: {
    account_id: string;
    period_start?: string;
    period_end?: string;
  }) {
    try {
      const query: GeneralLedgerAccountQueryDto = {
        period_start: data.period_start,
        period_end: data.period_end,
      };

      const result = await this.generalLedgerService.getAccountLedger(data.account_id, query);
      return {
        account: {
          id: result.account.id,
          accountCode: result.account.account_code,
          accountName: result.account.account_name,
          accountType: result.account.account_type,
        },
        openingBalance: result.opening_balance.toString(),
        closingBalance: result.closing_balance.toString(),
        transactions: result.transactions.map(trans => this.mapLedgerEntryToProto(trans)),
        summary: {
          totalDebits: result.summary.total_debits.toString(),
          totalCredits: result.summary.total_credits.toString(),
          netChange: result.summary.net_change.toString(),
        },
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get account ledger',
      });
    }
  }

  @GrpcMethod('GeneralLedgerService', 'GetGeneralLedgerReport')
  async getGeneralLedgerReport(data: {
    period_start?: string;
    period_end?: string;
    periodStart?: string;
    periodEnd?: string;
    account_type?: string;
    format?: string;
  }) {
    try {
      // Handle both snake_case and camelCase from different sources
      const period_start = data.period_start || data.periodStart;
      const period_end = data.period_end || data.periodEnd;

      // Validate that both are present and not empty
      if (!period_start || period_start.trim() === '') {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'period_start is required and cannot be empty',
        });
      }

      if (!period_end || period_end.trim() === '') {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'period_end is required and cannot be empty',
        });
      }

      const query: GeneralLedgerReportQueryDto = {
        period_start: period_start,
        period_end: period_end,
        account_type: data.account_type as any,
        format: data.format,
      };

      const report = await this.generalLedgerService.getReport(query);
      return {
        periodStart: report.period_start,
        periodEnd: report.period_end,
        accounts: report.accounts.map(acc => ({
          accountCode: acc.account_code,
          accountName: acc.account_name,
          openingBalance: acc.opening_balance.toString(),
          debits: acc.debits.toString(),
          credits: acc.credits.toString(),
          closingBalance: acc.closing_balance.toString(),
        })),
        totals: {
          totalDebits: report.totals.total_debits.toString(),
          totalCredits: report.totals.total_credits.toString(),
        },
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to get general ledger report',
      });
    }
  }

  private mapLedgerEntryToProto(entry: any): any {
    let transactionDate: string;
    if (entry.transactionDate instanceof Date) {
      transactionDate = entry.transactionDate.toISOString().split('T')[0];
    } else if (typeof entry.transactionDate === 'string') {
      transactionDate = entry.transactionDate.split('T')[0];
    } else {
      transactionDate = '';
    }

    return {
      id: entry.id,
      accountId: entry.accountId,
      accountCode: entry.account?.accountCode || entry.accountCode || '',
      accountName: entry.account?.accountName || entry.accountName || '',
      transactionDate: transactionDate,
      transactionType: entry.transactionType,
      transactionId: entry.transactionId,
      reference: entry.reference || '',
      description: entry.description || '',
      debit: entry.debit ? entry.debit.toString() : '0',
      credit: entry.credit ? entry.credit.toString() : '0',
      balance: entry.balance ? entry.balance.toString() : '0',
    };
  }
}
