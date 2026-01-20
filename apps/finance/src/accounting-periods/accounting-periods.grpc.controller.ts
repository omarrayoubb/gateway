import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AccountingPeriodsService } from './accounting-periods.service';
import { CreateAccountingPeriodDto } from './dto/create-accounting-period.dto';
import { UpdateAccountingPeriodDto } from './dto/update-accounting-period.dto';
import { AccountingPeriodPaginationDto } from './dto/pagination.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { PeriodType, PeriodStatus } from './entities/accounting-period.entity';

@Controller()
export class AccountingPeriodsGrpcController {
  constructor(private readonly accountingPeriodsService: AccountingPeriodsService) {}

  @GrpcMethod('AccountingPeriodsService', 'GetAccountingPeriods')
  async getAccountingPeriods(data: { status?: string; year?: string }) {
    try {
      const query: AccountingPeriodPaginationDto = {
        status: data.status as PeriodStatus,
        year: data.year,
      };

      const periods = await this.accountingPeriodsService.findAll(query);
      return {
        periods: periods.map(period => this.mapPeriodToProto(period)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get accounting periods',
      });
    }
  }

  @GrpcMethod('AccountingPeriodsService', 'GetAccountingPeriod')
  async getAccountingPeriod(data: { id: string }) {
    try {
      const period = await this.accountingPeriodsService.findOne(data.id);
      return this.mapPeriodToProto(period);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get accounting period',
      });
    }
  }

  @GrpcMethod('AccountingPeriodsService', 'GetCurrentAccountingPeriod')
  async getCurrentAccountingPeriod(data: { organization_id?: string }) {
    try {
      const period = await this.accountingPeriodsService.getCurrentPeriod(data.organization_id);
      if (!period) {
        throw new RpcException({
          code: 5, // NOT_FOUND
          message: 'No current accounting period found',
        });
      }
      return this.mapPeriodToProto(period);
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get current accounting period',
      });
    }
  }

  @GrpcMethod('AccountingPeriodsService', 'CreateAccountingPeriod')
  async createAccountingPeriod(data: any) {
    try {
      const createDto: CreateAccountingPeriodDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        period_name: data.periodName || data.period_name,
        period_type: (data.periodType || data.period_type) as PeriodType,
        period_start: data.periodStart || data.period_start,
        period_end: data.periodEnd || data.period_end,
        notes: data.notes || undefined,
      };

      const period = await this.accountingPeriodsService.create(createDto);
      return this.mapPeriodToProto(period);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create accounting period',
      });
    }
  }

  @GrpcMethod('AccountingPeriodsService', 'UpdateAccountingPeriod')
  async updateAccountingPeriod(data: any) {
    try {
      const updateDto: UpdateAccountingPeriodDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        period_name: data.periodName || data.period_name || undefined,
        period_type: data.periodType ? (data.periodType as PeriodType) : undefined,
        period_start: data.periodStart || data.period_start || undefined,
        period_end: data.periodEnd || data.period_end || undefined,
        notes: data.notes || undefined,
      };

      const period = await this.accountingPeriodsService.update(data.id, updateDto);
      return this.mapPeriodToProto(period);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update accounting period',
      });
    }
  }

  @GrpcMethod('AccountingPeriodsService', 'CloseAccountingPeriod')
  async closeAccountingPeriod(data: { id: string; notes?: string; force?: boolean; closed_by?: string }) {
    try {
      const closeDto: ClosePeriodDto = {
        notes: data.notes,
        force: data.force || false,
      };

      const result = await this.accountingPeriodsService.close(data.id, closeDto, data.closed_by);
      return {
        success: true,
        message: 'Period closed',
        period: this.mapPeriodToProto(result.period),
        summary: {
          totalTransactions: result.summary.total_transactions,
          totalDebits: result.summary.total_debits.toString(),
          totalCredits: result.summary.total_credits.toString(),
          unbalancedEntries: result.summary.unbalanced_entries,
        },
      };
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to close accounting period',
      });
    }
  }

  @GrpcMethod('AccountingPeriodsService', 'DeleteAccountingPeriod')
  async deleteAccountingPeriod(data: { id: string }) {
    try {
      await this.accountingPeriodsService.remove(data.id);
      return { success: true, message: 'Accounting period deleted' };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to delete accounting period',
      });
    }
  }

  private mapPeriodToProto(period: any): any {
    return {
      id: period.id,
      organizationId: period.organizationId || '',
      periodName: period.periodName,
      periodType: period.periodType,
      periodStart: period.periodStart instanceof Date ? period.periodStart.toISOString().split('T')[0] : period.periodStart,
      periodEnd: period.periodEnd instanceof Date ? period.periodEnd.toISOString().split('T')[0] : period.periodEnd,
      status: period.status,
      closedDate: period.closedDate ? period.closedDate.toISOString() : '',
      closedBy: period.closedBy || '',
      notes: period.notes || '',
    };
  }
}

