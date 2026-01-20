import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('budget-vs-actual')
  async getBudgetVsActual(@Query() query: any) {
    try {
      if (!query.fiscal_year) {
        throw new BadRequestException('fiscal_year is required');
      }

      const result = await this.financeService.getBudgetVsActual(query) as any;
      return {
        fiscal_year: result.fiscalYear,
        summary: {
          total_budget: parseFloat(result.summary?.totalBudget || '0'),
          total_actual: parseFloat(result.summary?.totalActual || '0'),
          variance: parseFloat(result.summary?.variance || '0'),
          variance_percent: parseFloat(result.summary?.variancePercent || '0'),
        },
        budgets: (result.budgets || []).map((budget: any) => ({
          budget_id: budget.budgetId,
          budget_name: budget.budgetName,
          account_code: budget.accountCode,
          account_name: budget.accountName,
          budget_amount: parseFloat(budget.budgetAmount || '0'),
          actual_amount: parseFloat(budget.actualAmount || '0'),
          variance: parseFloat(budget.variance || '0'),
          variance_percent: parseFloat(budget.variancePercent || '0'),
          periods: (budget.periods || []).map((period: any) => ({
            period: period.period,
            budget: parseFloat(period.budget || '0'),
            actual: parseFloat(period.actual || '0'),
            variance: parseFloat(period.variance || '0'),
          })),
        })),
      };
    } catch (error) {
      console.error('Error fetching budget vs actual report:', error);
      throw error;
    }
  }

  @Get('ar-aging')
  async getArAgingReport(@Query() query: any) {
    try {
      // Default to today's date if as_of_date is not provided
      const asOfDate = query.as_of_date || new Date().toISOString().split('T')[0];

      const result = await this.financeService.getArAgingReport({
        as_of_date: asOfDate,
        customer_id: query.customer_id,
        format: query.format,
      });

      return {
        as_of_date: result.asOfDate,
        summary: {
          total_receivables: parseFloat(result.summary.totalReceivables || '0'),
          current: parseFloat(result.summary.current || '0'),
          days_30: parseFloat(result.summary.days30 || '0'),
          days_60: parseFloat(result.summary.days60 || '0'),
          days_90: parseFloat(result.summary.days90 || '0'),
          over_90: parseFloat(result.summary.over90 || '0'),
        },
        customers: (result.customers || []).map(customer => ({
          customer_id: customer.customerId,
          customer_name: customer.customerName,
          total_balance: parseFloat(customer.totalBalance || '0'),
          current: parseFloat(customer.current || '0'),
          days_30: parseFloat(customer.days30 || '0'),
          days_60: parseFloat(customer.days60 || '0'),
          days_90: parseFloat(customer.days90 || '0'),
          over_90: parseFloat(customer.over90 || '0'),
          invoices: (customer.invoices || []).map(invoice => ({
            invoice_number: invoice.invoiceNumber,
            invoice_date: invoice.invoiceDate,
            due_date: invoice.dueDate,
            amount: parseFloat(invoice.amount || '0'),
            days_overdue: invoice.daysOverdue || 0,
            aging_bucket: invoice.agingBucket,
          })),
        })),
      };
    } catch (error) {
      console.error('Error fetching AR aging report:', error);
      throw error;
    }
  }
}

