import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CashFlowService } from './cash-flow.service';
import { GetCashFlowDto } from './dto/get-cash-flow.dto';
import { ForecastCashFlowDto } from './dto/forecast-cash-flow.dto';
import { ActualCashFlowDto } from './dto/actual-cash-flow.dto';
import { CalculateCashFlowDto } from './dto/calculate-cash-flow.dto';

@Controller()
export class CashFlowGrpcController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @GrpcMethod('CashFlowService', 'GetCashFlow')
  async getCashFlow(data: { periodStart?: string; periodEnd?: string; accountType?: string }) {
    try {
      // Proto now uses camelCase, so access directly
      const periodStart = data.periodStart;
      const periodEnd = data.periodEnd;
      const accountType = data.accountType;

      const query: GetCashFlowDto = {
        period_start: periodStart,
        period_end: periodEnd,
        account_type: accountType,
      };

      const results = await this.cashFlowService.getCashFlow(query);
      return {
        cashFlows: results.map(flow => ({
          id: flow.id,
          organizationId: flow.organization_id,
          periodStart: flow.period_start,
          periodEnd: flow.period_end,
          accountId: flow.account_id,
          accountName: flow.account_name,
          openingBalance: flow.opening_balance.toString(),
          inflows: flow.inflows.toString(),
          outflows: flow.outflows.toString(),
          closingBalance: flow.closing_balance.toString(),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to get cash flow',
      });
    }
  }

  @GrpcMethod('CashFlowService', 'GetForecast')
  async getForecast(data: any) {
    try {
      // Support both camelCase and snake_case
      const periodStart = data.period_start || data.periodStart;
      const periodEnd = data.period_end || data.periodEnd;

      if (!periodStart || !periodEnd) {
        throw new BadRequestException('period_start and period_end are required');
      }

      const query: ForecastCashFlowDto = {
        period_start: periodStart,
        period_end: periodEnd,
        include_recurring: data.includeRecurring !== undefined 
          ? (typeof data.includeRecurring === 'boolean' ? data.includeRecurring : data.includeRecurring === 'true')
          : false,
      };

      const forecast = await this.cashFlowService.getForecast(query);
      return {
        periodStart: forecast.period_start,
        periodEnd: forecast.period_end,
        openingBalance: forecast.opening_balance.toString(),
        projectedInflows: forecast.projected_inflows.toString(),
        projectedOutflows: forecast.projected_outflows.toString(),
        projectedClosingBalance: forecast.projected_closing_balance.toString(),
        dailyForecast: forecast.daily_forecast.map(day => ({
          date: day.date,
          inflows: day.inflows.toString(),
          outflows: day.outflows.toString(),
          balance: day.balance.toString(),
        })),
        sources: {
          customerPayments: forecast.sources.customer_payments.toString(),
          vendorPayments: forecast.sources.vendor_payments.toString(),
          expenses: forecast.sources.expenses.toString(),
        },
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to get cash flow forecast',
      });
    }
  }

  @GrpcMethod('CashFlowService', 'GetActual')
  async getActual(data: {
    periodStart?: string;
    periodEnd?: string;
  }) {
    try {
      // Proto now uses camelCase, so access directly
      const periodStart = data.periodStart;
      const periodEnd = data.periodEnd;

      // Validate that both are present and not empty
      if (!periodStart || periodStart.trim() === '') {
        throw new BadRequestException('periodStart is required and cannot be empty');
      }

      if (!periodEnd || periodEnd.trim() === '') {
        throw new BadRequestException('periodEnd is required and cannot be empty');
      }

      const query: ActualCashFlowDto = {
        period_start: periodStart,
        period_end: periodEnd,
      };

      const actual = await this.cashFlowService.getActual(query);
      return {
        periodStart: actual.period_start,
        periodEnd: actual.period_end,
        openingBalance: actual.opening_balance.toString(),
        actualInflows: actual.actual_inflows.toString(),
        actualOutflows: actual.actual_outflows.toString(),
        actualClosingBalance: actual.actual_closing_balance.toString(),
        dailyActual: actual.daily_actual.map(day => ({
          date: day.date,
          inflows: day.inflows.toString(),
          outflows: day.outflows.toString(),
          balance: day.balance.toString(),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to get actual cash flow',
      });
    }
  }

  @GrpcMethod('CashFlowService', 'CalculateCashFlow')
  async calculateCashFlow(data: {
    periodStart: string;
    periodEnd: string;
    accountIds?: string[];
    includeForecast?: boolean;
  }) {
    try {
      // Proto now uses camelCase, so access directly
      const periodStart = data.periodStart;
      const periodEnd = data.periodEnd;

      if (!periodStart || periodStart.trim() === '') {
        throw new BadRequestException('periodStart is required and cannot be empty');
      }

      if (!periodEnd || periodEnd.trim() === '') {
        throw new BadRequestException('periodEnd is required and cannot be empty');
      }

      const query: CalculateCashFlowDto = {
        period_start: periodStart,
        period_end: periodEnd,
        account_ids: data.accountIds || undefined,
        include_forecast: data.includeForecast !== undefined 
          ? (typeof data.includeForecast === 'boolean' ? data.includeForecast : data.includeForecast === 'true')
          : false,
      };

      const result = await this.cashFlowService.calculate(query);
      return {
        periodStart: result.period_start,
        periodEnd: result.period_end,
        accounts: result.accounts.map(acc => ({
          accountId: acc.account_id,
          accountName: acc.account_name,
          openingBalance: acc.opening_balance.toString(),
          inflows: acc.inflows.toString(),
          outflows: acc.outflows.toString(),
          closingBalance: acc.closing_balance.toString(),
        })),
        totalOpeningBalance: result.total_opening_balance.toString(),
        totalInflows: result.total_inflows.toString(),
        totalOutflows: result.total_outflows.toString(),
        totalClosingBalance: result.total_closing_balance.toString(),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to calculate cash flow',
      });
    }
  }
}

