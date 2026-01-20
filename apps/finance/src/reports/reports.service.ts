import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, IsNull, Not, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { Budget, PeriodType } from '../budgets/entities/budget.entity';
import { BudgetPeriod } from '../budgets/budget-periods/entities/budget-period.entity';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';

export enum AgingBucket {
  CURRENT = 'current',
  DAYS_30 = '30',
  DAYS_60 = '60',
  DAYS_90 = '90',
  OVER_90 = 'over_90',
}

interface InvoiceAging {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  days_overdue: number;
  aging_bucket: AgingBucket;
}

interface CustomerAging {
  customer_id: string;
  customer_name: string;
  total_balance: number;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  over_90: number;
  invoices: InvoiceAging[];
}

interface ArAgingSummary {
  total_receivables: number;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  over_90: number;
}

interface ArAgingReport {
  as_of_date: string;
  summary: ArAgingSummary;
  customers: CustomerAging[];
}

interface BudgetVsActualPeriod {
  period: string;
  budget: number;
  actual: number;
  variance: number;
}

interface BudgetVsActualItem {
  budget_id: string;
  budget_name: string;
  account_code: string;
  account_name: string;
  budget_amount: number;
  actual_amount: number;
  variance: number;
  variance_percent: number;
  periods: BudgetVsActualPeriod[];
}

interface BudgetVsActualSummary {
  total_budget: number;
  total_actual: number;
  variance: number;
  variance_percent: number;
}

interface BudgetVsActualReport {
  fiscal_year: number;
  summary: BudgetVsActualSummary;
  budgets: BudgetVsActualItem[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(BudgetPeriod)
    private readonly budgetPeriodRepository: Repository<BudgetPeriod>,
    @InjectRepository(GeneralLedger)
    private readonly generalLedgerRepository: Repository<GeneralLedger>,
  ) {}

  async getArAgingReport(
    asOfDate: string,
    customerId?: string,
    format?: string,
  ): Promise<ArAgingReport> {
    try {
      // Default to today's date if as_of_date is not provided
      if (!asOfDate) {
        asOfDate = new Date().toISOString().split('T')[0];
      }

      const asOf = new Date(asOfDate);
      if (isNaN(asOf.getTime())) {
        throw new BadRequestException('Invalid as_of_date format. Use YYYY-MM-DD');
      }

      // Build query for invoices with outstanding balance
      const queryBuilder = this.invoiceRepository
        .createQueryBuilder('invoice')
        .where('invoice.balanceDue > :zero', { zero: 0 })
        .andWhere('invoice.status != :cancelledStatus', { cancelledStatus: InvoiceStatus.CANCELLED });

      // Filter by customer if provided
      if (customerId) {
        queryBuilder.andWhere('invoice.customerAccountId = :customerId', { customerId });
      }

      // Only get invoices that have a due date (for aging calculation)
      queryBuilder.andWhere('invoice.dueDate IS NOT NULL');

      const invoices = await queryBuilder.getMany();

      // Group invoices by customer and calculate aging
      const customerMap = new Map<string, CustomerAging>();

      let summary: ArAgingSummary = {
        total_receivables: 0,
        current: 0,
        days_30: 0,
        days_60: 0,
        days_90: 0,
        over_90: 0,
      };

      for (const invoice of invoices) {
        // Skip invoices without due date (shouldn't happen due to query filter, but safety check)
        if (!invoice.dueDate) {
          continue;
        }

        const customerIdKey = invoice.customerAccountId || 'unknown';
        const customerName = invoice.customerAccountName || invoice.customerName || 'Unknown Customer';

        // Calculate days overdue
        const dueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.max(0, Math.floor((asOf.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

        // Determine aging bucket
        let agingBucket: AgingBucket;
        if (daysOverdue === 0) {
          agingBucket = AgingBucket.CURRENT;
        } else if (daysOverdue <= 30) {
          agingBucket = AgingBucket.DAYS_30;
        } else if (daysOverdue <= 60) {
          agingBucket = AgingBucket.DAYS_60;
        } else if (daysOverdue <= 90) {
          agingBucket = AgingBucket.DAYS_90;
        } else {
          agingBucket = AgingBucket.OVER_90;
        }

        // TypeORM decimal columns can return as string or number
        const balance = typeof invoice.balanceDue === 'number' 
          ? invoice.balanceDue 
          : parseFloat(String(invoice.balanceDue || '0'));

        // Initialize customer if not exists
        if (!customerMap.has(customerIdKey)) {
          customerMap.set(customerIdKey, {
            customer_id: customerIdKey,
            customer_name: customerName,
            total_balance: 0,
            current: 0,
            days_30: 0,
            days_60: 0,
            days_90: 0,
            over_90: 0,
            invoices: [],
          });
        }

        const customer = customerMap.get(customerIdKey)!;

        // Convert dates to Date objects if they're strings
        // TypeORM can return dates as strings or Date objects depending on the database driver
        const invoiceDate = invoice.invoiceDate 
          ? (invoice.invoiceDate instanceof Date 
              ? invoice.invoiceDate 
              : new Date(invoice.invoiceDate))
          : null;
        
        const dueDateObj = invoice.dueDate 
          ? (invoice.dueDate instanceof Date 
              ? invoice.dueDate 
              : new Date(invoice.dueDate))
          : null;

        // Add invoice to customer
        customer.invoices.push({
          invoice_number: invoice.invoiceNumber || '',
          invoice_date: invoiceDate && !isNaN(invoiceDate.getTime()) 
            ? invoiceDate.toISOString().split('T')[0] 
            : '',
          due_date: dueDateObj && !isNaN(dueDateObj.getTime()) 
            ? dueDateObj.toISOString().split('T')[0] 
            : '',
          amount: balance,
          days_overdue: daysOverdue,
          aging_bucket: agingBucket,
        });

        // Update customer totals
        customer.total_balance += balance;
        switch (agingBucket) {
          case AgingBucket.CURRENT:
            customer.current += balance;
            summary.current += balance;
            break;
          case AgingBucket.DAYS_30:
            customer.days_30 += balance;
            summary.days_30 += balance;
            break;
          case AgingBucket.DAYS_60:
            customer.days_60 += balance;
            summary.days_60 += balance;
            break;
          case AgingBucket.DAYS_90:
            customer.days_90 += balance;
            summary.days_90 += balance;
            break;
          case AgingBucket.OVER_90:
            customer.over_90 += balance;
            summary.over_90 += balance;
            break;
        }

        summary.total_receivables += balance;
      }

      // Convert map to array
      const customers = Array.from(customerMap.values());

      // Sort customers by total_balance descending
      customers.sort((a, b) => b.total_balance - a.total_balance);

      // Sort invoices within each customer by days_overdue descending
      customers.forEach(customer => {
        customer.invoices.sort((a, b) => b.days_overdue - a.days_overdue);
      });

      return {
        as_of_date: asOfDate,
        summary,
        customers,
      };
    } catch (error) {
      console.error('Error in ReportsService.getArAgingReport:', error);
      throw error;
    }
  }

  async getBudgetVsActual(
    fiscalYear: number,
    department?: string,
    projectId?: string,
    accountId?: string,
  ): Promise<BudgetVsActualReport> {
    try {
      if (!fiscalYear) {
        throw new BadRequestException('fiscal_year is required');
      }

      // Build query for budgets
      const budgetQueryBuilder = this.budgetRepository
        .createQueryBuilder('budget')
        .where('budget.fiscalYear = :fiscalYear', { fiscalYear });

      if (department) {
        budgetQueryBuilder.andWhere('budget.department = :department', { department });
      }

      if (projectId) {
        budgetQueryBuilder.andWhere('budget.projectId = :projectId', { projectId });
      }

      if (accountId) {
        budgetQueryBuilder.andWhere('budget.accountId = :accountId', { accountId });
      }

      const budgets = await budgetQueryBuilder.getMany();

      // Calculate date range for the fiscal year
      const yearStart = new Date(fiscalYear, 0, 1); // January 1
      const yearEnd = new Date(fiscalYear, 11, 31, 23, 59, 59, 999); // December 31

      const budgetItems: BudgetVsActualItem[] = [];
      let totalBudget = 0;
      let totalActual = 0;

      for (const budget of budgets) {
        // Get budget periods
        const budgetPeriods = await this.budgetPeriodRepository.find({
          where: { budgetId: budget.id },
        });

        // Get actual amounts from General Ledger for this account and period
        const actualEntries = await this.generalLedgerRepository.find({
          where: {
            accountId: budget.accountId,
            transactionDate: Between(yearStart, yearEnd),
          },
        });

        // Calculate actual amount (net of debits and credits)
        let actualAmount = 0;
        for (const entry of actualEntries) {
          const debit = typeof entry.debit === 'number' ? entry.debit : parseFloat(String(entry.debit || '0'));
          const credit = typeof entry.credit === 'number' ? entry.credit : parseFloat(String(entry.credit || '0'));
          actualAmount += debit - credit;
        }

        const budgetAmount = typeof budget.budgetAmount === 'number' 
          ? budget.budgetAmount 
          : parseFloat(String(budget.budgetAmount || '0'));

        const variance = actualAmount - budgetAmount;
        const variancePercent = budgetAmount !== 0 ? (variance / budgetAmount) * 100 : 0;

        // Calculate period breakdowns
        const periods: BudgetVsActualPeriod[] = [];
        
        if (budgetPeriods && budgetPeriods.length > 0) {
          // If budget has period breakdowns, calculate actuals per period
          for (const budgetPeriod of budgetPeriods) {
            const periodBudget = typeof budgetPeriod.amount === 'number' 
              ? budgetPeriod.amount 
              : parseFloat(String(budgetPeriod.amount || '0'));

            // Parse period string (e.g., "2024-01" for monthly, "2024-Q1" for quarterly, "2024" for annually)
            let periodStart: Date;
            let periodEnd: Date;

            if (budget.periodType === PeriodType.MONTHLY) {
              // Format: "2024-01"
              const [year, month] = budgetPeriod.period.split('-').map(Number);
              periodStart = new Date(year, month - 1, 1);
              periodEnd = new Date(year, month, 0, 23, 59, 59, 999);
            } else if (budget.periodType === PeriodType.QUARTERLY) {
              // Format: "2024-Q1"
              const [year, quarter] = budgetPeriod.period.split('-Q').map(Number);
              const quarterStartMonth = (quarter - 1) * 3;
              periodStart = new Date(year, quarterStartMonth, 1);
              periodEnd = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
            } else {
              // ANNUALLY - use full year
              periodStart = yearStart;
              periodEnd = yearEnd;
            }

            // Get actuals for this period
            const periodEntries = await this.generalLedgerRepository.find({
              where: {
                accountId: budget.accountId,
                transactionDate: Between(periodStart, periodEnd),
              },
            });

            let periodActual = 0;
            for (const entry of periodEntries) {
              const debit = typeof entry.debit === 'number' ? entry.debit : parseFloat(String(entry.debit || '0'));
              const credit = typeof entry.credit === 'number' ? entry.credit : parseFloat(String(entry.credit || '0'));
              periodActual += debit - credit;
            }

            periods.push({
              period: budgetPeriod.period,
              budget: periodBudget,
              actual: periodActual,
              variance: periodActual - periodBudget,
            });
          }
        } else {
          // No period breakdown - create single period for the year
          periods.push({
            period: fiscalYear.toString(),
            budget: budgetAmount,
            actual: actualAmount,
            variance: variance,
          });
        }

        budgetItems.push({
          budget_id: budget.id,
          budget_name: budget.budgetName,
          account_code: budget.accountCode || '',
          account_name: budget.accountName || '',
          budget_amount: budgetAmount,
          actual_amount: actualAmount,
          variance: variance,
          variance_percent: variancePercent,
          periods: periods,
        });

        totalBudget += budgetAmount;
        totalActual += actualAmount;
      }

      const totalVariance = totalActual - totalBudget;
      const totalVariancePercent = totalBudget !== 0 ? (totalVariance / totalBudget) * 100 : 0;

      return {
        fiscal_year: fiscalYear,
        summary: {
          total_budget: totalBudget,
          total_actual: totalActual,
          variance: totalVariance,
          variance_percent: totalVariancePercent,
        },
        budgets: budgetItems,
      };
    } catch (error) {
      console.error('Error in ReportsService.getBudgetVsActual:', error);
      throw error;
    }
  }
}

