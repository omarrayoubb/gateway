import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsGrpcController {
  constructor(private readonly reportsService: ReportsService) {}

  @GrpcMethod('ReportsService', 'GetArAgingReport')
  async getArAgingReport(data: { as_of_date: string; customer_id?: string; format?: string }) {
    try {
      const report = await this.reportsService.getArAgingReport(
        data.as_of_date,
        data.customer_id,
        data.format,
      );

      return {
        asOfDate: report.as_of_date,
        summary: {
          totalReceivables: report.summary.total_receivables.toString(),
          current: report.summary.current.toString(),
          days30: report.summary.days_30.toString(),
          days60: report.summary.days_60.toString(),
          days90: report.summary.days_90.toString(),
          over90: report.summary.over_90.toString(),
        },
        customers: report.customers.map(customer => ({
          customerId: customer.customer_id,
          customerName: customer.customer_name,
          totalBalance: customer.total_balance.toString(),
          current: customer.current.toString(),
          days30: customer.days_30.toString(),
          days60: customer.days_60.toString(),
          days90: customer.days_90.toString(),
          over90: customer.over_90.toString(),
          invoices: customer.invoices.map(invoice => ({
            invoiceNumber: invoice.invoice_number,
            invoiceDate: invoice.invoice_date,
            dueDate: invoice.due_date,
            amount: invoice.amount.toString(),
            daysOverdue: invoice.days_overdue,
            agingBucket: invoice.aging_bucket,
          })),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to get AR aging report',
      });
    }
  }

  @GrpcMethod('ReportsService', 'GetBudgetVsActual')
  async getBudgetVsActual(data: {
    fiscalYear: number;
    department?: string;
    projectId?: string;
    accountId?: string;
    format?: string;
  }) {
    try {
      const report = await this.reportsService.getBudgetVsActual(
        data.fiscalYear,
        data.department,
        data.projectId,
        data.accountId,
      );

      return {
        fiscalYear: report.fiscal_year,
        summary: {
          totalBudget: report.summary.total_budget.toString(),
          totalActual: report.summary.total_actual.toString(),
          variance: report.summary.variance.toString(),
          variancePercent: report.summary.variance_percent.toString(),
        },
        budgets: report.budgets.map(budget => ({
          budgetId: budget.budget_id,
          budgetName: budget.budget_name,
          accountCode: budget.account_code,
          accountName: budget.account_name,
          budgetAmount: budget.budget_amount.toString(),
          actualAmount: budget.actual_amount.toString(),
          variance: budget.variance.toString(),
          variancePercent: budget.variance_percent.toString(),
          periods: budget.periods.map(period => ({
            period: period.period,
            budget: period.budget.toString(),
            actual: period.actual.toString(),
            variance: period.variance.toString(),
          })),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to get budget vs actual report',
      });
    }
  }
}

