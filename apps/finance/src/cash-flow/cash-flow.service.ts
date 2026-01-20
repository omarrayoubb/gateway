import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { GetCashFlowDto } from './dto/get-cash-flow.dto';
import { ForecastCashFlowDto } from './dto/forecast-cash-flow.dto';
import { ActualCashFlowDto } from './dto/actual-cash-flow.dto';
import { CalculateCashFlowDto } from './dto/calculate-cash-flow.dto';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { CashAccount } from '../cash-accounts/entities/cash-account.entity';
import { CustomerPayment, PaymentStatus } from '../customer-payments/entities/customer-payment.entity';
import { VendorPayment, VendorPaymentStatus } from '../vendor-payments/entities/vendor-payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { RecurringBill } from '../recurring-bills/entities/recurring-bill.entity';
import { PaymentSchedule } from '../payment-schedules/entities/payment-schedule.entity';
import { BankTransaction, BankTransactionType } from '../bank-transactions/entities/bank-transaction.entity';

@Injectable()
export class CashFlowService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(CashAccount)
    private readonly cashAccountRepository: Repository<CashAccount>,
    @InjectRepository(CustomerPayment)
    private readonly customerPaymentRepository: Repository<CustomerPayment>,
    @InjectRepository(VendorPayment)
    private readonly vendorPaymentRepository: Repository<VendorPayment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(PurchaseBill)
    private readonly purchaseBillRepository: Repository<PurchaseBill>,
    @InjectRepository(RecurringBill)
    private readonly recurringBillRepository: Repository<RecurringBill>,
    @InjectRepository(PaymentSchedule)
    private readonly paymentScheduleRepository: Repository<PaymentSchedule>,
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepository: Repository<BankTransaction>,
  ) {}

  async getCashFlow(query: GetCashFlowDto): Promise<Array<{
    id: string;
    organization_id: string;
    period_start: string;
    period_end: string;
    account_id: string;
    account_name: string;
    opening_balance: number;
    inflows: number;
    outflows: number;
    closing_balance: number;
  }>> {
    try {
      // Default to current month if not provided
      let periodStart: Date;
      let periodEnd: Date;
      
      if (!query.period_start || !query.period_end) {
        const now = new Date();
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        periodEnd.setHours(23, 59, 59, 999);
      } else {
        periodStart = new Date(query.period_start);
        periodEnd = new Date(query.period_end);
        periodEnd.setHours(23, 59, 59, 999);
      }

      const periodStartStr = query.period_start || periodStart.toISOString().split('T')[0];
      const periodEndStr = query.period_end || periodEnd.toISOString().split('T')[0];

      const results: Array<{
        id: string;
        organization_id: string;
        period_start: string;
        period_end: string;
        account_id: string;
        account_name: string;
        opening_balance: number;
        inflows: number;
        outflows: number;
        closing_balance: number;
      }> = [];

      // Get bank accounts
      if (!query.account_type || query.account_type === 'bank') {
        const bankAccounts = await this.bankAccountRepository.find({
          where: { isActive: true },
        });

        for (const account of bankAccounts) {
          const flows = await this.calculateAccountFlow(account.id, 'bank', periodStart, periodEnd);
          results.push({
            id: `bank-${account.id}`,
            organization_id: account.organizationId || '',
            period_start: periodStartStr,
            period_end: periodEndStr,
            account_id: account.id,
            account_name: account.accountName,
            opening_balance: flows.openingBalance,
            inflows: flows.inflows,
            outflows: flows.outflows,
            closing_balance: flows.closingBalance,
          });
        }
      }

      // Get cash accounts
      if (!query.account_type || query.account_type === 'cash') {
        const cashAccounts = await this.cashAccountRepository.find({
          where: { isActive: true },
        });

        for (const account of cashAccounts) {
          const flows = await this.calculateAccountFlow(account.id, 'cash', periodStart, periodEnd);
          results.push({
            id: `cash-${account.id}`,
            organization_id: account.organizationId || '',
            period_start: periodStartStr,
            period_end: periodEndStr,
            account_id: account.id,
            account_name: account.accountName,
            opening_balance: flows.openingBalance,
            inflows: flows.inflows,
            outflows: flows.outflows,
            closing_balance: flows.closingBalance,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in CashFlowService.getCashFlow:', error);
      throw error;
    }
  }

  async getForecast(query: ForecastCashFlowDto): Promise<{
    period_start: string;
    period_end: string;
    opening_balance: number;
    projected_inflows: number;
    projected_outflows: number;
    projected_closing_balance: number;
    daily_forecast: Array<{
      date: string;
      inflows: number;
      outflows: number;
      balance: number;
    }>;
    sources: {
      customer_payments: number;
      vendor_payments: number;
      expenses: number;
    };
  }> {
    try {
      const periodStart = new Date(query.period_start);
      const periodEnd = new Date(query.period_end);
      periodEnd.setHours(23, 59, 59, 999);

      // Get opening balance from all active accounts
      const bankAccounts = await this.bankAccountRepository.find({ where: { isActive: true } });
      const cashAccounts = await this.cashAccountRepository.find({ where: { isActive: true } });

      let openingBalance = 0;
      for (const account of [...bankAccounts, ...cashAccounts]) {
        const currentBalance = typeof account.currentBalance === 'number'
          ? account.currentBalance
          : parseFloat(String(account.currentBalance || '0')) || 0;
        openingBalance += currentBalance;
      }

      // Get scheduled customer payments
      const scheduledCustomerPayments = await this.customerPaymentRepository.find({
        where: {
          paymentDate: Between(periodStart, periodEnd),
          status: 'scheduled' as any,
        },
      });

      // Get scheduled vendor payments
      const scheduledVendorPayments = await this.vendorPaymentRepository.find({
        where: {
          paymentDate: Between(periodStart, periodEnd),
          status: 'scheduled' as any,
        },
      });

      // Get payment schedules
      const paymentSchedules = await this.paymentScheduleRepository.find({
        where: {
          dueDate: Between(periodStart, periodEnd),
          status: 'scheduled' as any,
        },
      });

      // Get recurring bills if include_recurring is true
      let recurringBills: RecurringBill[] = [];
      if (query.include_recurring) {
        recurringBills = await this.recurringBillRepository.find({
          where: {
            isActive: true,
            nextDueDate: Between(periodStart, periodEnd),
          },
        });
      }

      // Calculate projected inflows (customer payments)
      let projectedInflows = 0;
      for (const payment of scheduledCustomerPayments) {
        const amount = typeof payment.amount === 'number'
          ? payment.amount
          : parseFloat(String(payment.amount || '0')) || 0;
        projectedInflows += amount;
      }

      // Calculate projected outflows (vendor payments + payment schedules + recurring bills)
      let projectedOutflows = 0;
      for (const payment of scheduledVendorPayments) {
        const amount = typeof payment.amount === 'number'
          ? payment.amount
          : parseFloat(String(payment.amount || '0')) || 0;
        projectedOutflows += amount;
      }

      for (const schedule of paymentSchedules) {
        const amount = typeof schedule.amountDue === 'number'
          ? schedule.amountDue
          : parseFloat(String(schedule.amountDue || '0')) || 0;
        projectedOutflows += amount;
      }

      for (const bill of recurringBills) {
        const amount = typeof bill.amount === 'number'
          ? bill.amount
          : parseFloat(String(bill.amount || '0')) || 0;
        projectedOutflows += amount;
      }

      const projectedClosingBalance = openingBalance + projectedInflows - projectedOutflows;

      // Generate daily forecast
      const dailyForecast: Array<{
        date: string;
        inflows: number;
        outflows: number;
        balance: number;
      }> = [];

      let runningBalance = openingBalance;
      const currentDate = new Date(periodStart);

      while (currentDate <= periodEnd) {
        const dateStr = currentDate.toISOString().split('T')[0];
        let dayInflows = 0;
        let dayOutflows = 0;

        // Customer payments on this date
        for (const payment of scheduledCustomerPayments) {
          const paymentDate = new Date(payment.paymentDate);
          if (paymentDate.toISOString().split('T')[0] === dateStr) {
            const amount = typeof payment.amount === 'number'
              ? payment.amount
              : parseFloat(String(payment.amount || '0')) || 0;
            dayInflows += amount;
          }
        }

        // Vendor payments on this date
        for (const payment of scheduledVendorPayments) {
          const paymentDate = new Date(payment.paymentDate);
          if (paymentDate.toISOString().split('T')[0] === dateStr) {
            const amount = typeof payment.amount === 'number'
              ? payment.amount
              : parseFloat(String(payment.amount || '0')) || 0;
            dayOutflows += amount;
          }
        }

        // Payment schedules on this date
        for (const schedule of paymentSchedules) {
          const dueDate = new Date(schedule.dueDate);
          if (dueDate.toISOString().split('T')[0] === dateStr) {
            const amount = typeof schedule.amountDue === 'number'
              ? schedule.amountDue
              : parseFloat(String(schedule.amountDue || '0')) || 0;
            dayOutflows += amount;
          }
        }

        // Recurring bills on this date
        for (const bill of recurringBills) {
          const dueDate = bill.nextDueDate ? new Date(bill.nextDueDate) : null;
          if (dueDate && dueDate.toISOString().split('T')[0] === dateStr) {
            const amount = typeof bill.amount === 'number'
              ? bill.amount
              : parseFloat(String(bill.amount || '0')) || 0;
            dayOutflows += amount;
          }
        }

        runningBalance = runningBalance + dayInflows - dayOutflows;

        dailyForecast.push({
          date: dateStr,
          inflows: dayInflows,
          outflows: dayOutflows,
          balance: runningBalance,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        period_start: query.period_start,
        period_end: query.period_end,
        opening_balance: openingBalance,
        projected_inflows: projectedInflows,
        projected_outflows: projectedOutflows,
        projected_closing_balance: projectedClosingBalance,
        daily_forecast: dailyForecast,
        sources: {
          customer_payments: projectedInflows,
          vendor_payments: projectedOutflows * 0.7, // Estimate
          expenses: projectedOutflows * 0.3, // Estimate
        },
      };
    } catch (error) {
      console.error('Error in CashFlowService.getForecast:', error);
      throw error;
    }
  }

  async getActual(query: ActualCashFlowDto): Promise<{
    period_start: string;
    period_end: string;
    opening_balance: number;
    actual_inflows: number;
    actual_outflows: number;
    actual_closing_balance: number;
    daily_actual: Array<{
      date: string;
      inflows: number;
      outflows: number;
      balance: number;
    }>;
  }> {
    try {
      const periodStart = new Date(query.period_start);
      const periodEnd = new Date(query.period_end);
      periodEnd.setHours(23, 59, 59, 999);

      // Get opening balance (balance before period start)
      const bankAccounts = await this.bankAccountRepository.find({ where: { isActive: true } });
      const cashAccounts = await this.cashAccountRepository.find({ where: { isActive: true } });

      // Calculate opening balance from transactions before period start
      let openingBalance = 0;
      for (const account of [...bankAccounts, ...cashAccounts]) {
        const openingBalanceForAccount = await this.calculateOpeningBalance(account.id, 'bank', periodStart);
        openingBalance += openingBalanceForAccount;
      }

      // Get actual customer payments in period
      // Include ALLOCATED and PENDING payments as they represent actual cash flow
      const customerPayments = await this.customerPaymentRepository.find({
        where: {
          paymentDate: Between(periodStart, periodEnd),
        },
      });

      // Get actual vendor payments in period (only PROCESSED payments)
      const vendorPayments = await this.vendorPaymentRepository.find({
        where: {
          paymentDate: Between(periodStart, periodEnd),
          status: VendorPaymentStatus.PROCESSED,
        },
      });

      // Get bank transactions in period
      const bankTransactions = await this.bankTransactionRepository.find({
        where: {
          transactionDate: Between(periodStart, periodEnd),
        },
      });

      // Calculate actual inflows
      let actualInflows = 0;
      for (const payment of customerPayments) {
        const amount = typeof payment.amount === 'number'
          ? payment.amount
          : parseFloat(String(payment.amount || '0')) || 0;
        actualInflows += amount;
      }

      for (const transaction of bankTransactions) {
        if (transaction.transactionType === BankTransactionType.DEPOSIT || 
            transaction.transactionType === BankTransactionType.INTEREST) {
          const amount = typeof transaction.amount === 'number'
            ? transaction.amount
            : parseFloat(String(transaction.amount || '0')) || 0;
          actualInflows += amount;
        }
      }

      // Calculate actual outflows
      let actualOutflows = 0;
      for (const payment of vendorPayments) {
        const amount = typeof payment.amount === 'number'
          ? payment.amount
          : parseFloat(String(payment.amount || '0')) || 0;
        actualOutflows += amount;
      }

      for (const transaction of bankTransactions) {
        if (transaction.transactionType === BankTransactionType.WITHDRAWAL || 
            transaction.transactionType === BankTransactionType.FEE) {
          const amount = typeof transaction.amount === 'number'
            ? transaction.amount
            : parseFloat(String(transaction.amount || '0')) || 0;
          actualOutflows += amount;
        }
      }

      const actualClosingBalance = openingBalance + actualInflows - actualOutflows;

      // Generate daily actual
      const dailyActual: Array<{
        date: string;
        inflows: number;
        outflows: number;
        balance: number;
      }> = [];

      let runningBalance = openingBalance;
      const currentDate = new Date(periodStart);

      while (currentDate <= periodEnd) {
        const dateStr = currentDate.toISOString().split('T')[0];
        let dayInflows = 0;
        let dayOutflows = 0;

        // Customer payments on this date
        for (const payment of customerPayments) {
          const paymentDate = new Date(payment.paymentDate);
          if (paymentDate.toISOString().split('T')[0] === dateStr) {
            const amount = typeof payment.amount === 'number'
              ? payment.amount
              : parseFloat(String(payment.amount || '0')) || 0;
            dayInflows += amount;
          }
        }

        // Vendor payments on this date
        for (const payment of vendorPayments) {
          const paymentDate = new Date(payment.paymentDate);
          if (paymentDate.toISOString().split('T')[0] === dateStr) {
            const amount = typeof payment.amount === 'number'
              ? payment.amount
              : parseFloat(String(payment.amount || '0')) || 0;
            dayOutflows += amount;
          }
        }

        // Bank transactions on this date
        for (const transaction of bankTransactions) {
          const transactionDate = new Date(transaction.transactionDate);
          if (transactionDate.toISOString().split('T')[0] === dateStr) {
            const amount = typeof transaction.amount === 'number'
              ? transaction.amount
              : parseFloat(String(transaction.amount || '0')) || 0;
            
            if (transaction.transactionType === BankTransactionType.DEPOSIT || 
                transaction.transactionType === BankTransactionType.INTEREST) {
              dayInflows += amount;
            } else if (transaction.transactionType === BankTransactionType.WITHDRAWAL || 
                       transaction.transactionType === BankTransactionType.FEE) {
              dayOutflows += amount;
            }
          }
        }

        runningBalance = runningBalance + dayInflows - dayOutflows;

        dailyActual.push({
          date: dateStr,
          inflows: dayInflows,
          outflows: dayOutflows,
          balance: runningBalance,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        period_start: query.period_start,
        period_end: query.period_end,
        opening_balance: openingBalance,
        actual_inflows: actualInflows,
        actual_outflows: actualOutflows,
        actual_closing_balance: actualClosingBalance,
        daily_actual: dailyActual,
      };
    } catch (error) {
      console.error('Error in CashFlowService.getActual:', error);
      throw error;
    }
  }

  async calculate(query: CalculateCashFlowDto): Promise<{
    period_start: string;
    period_end: string;
    accounts: Array<{
      account_id: string;
      account_name: string;
      opening_balance: number;
      inflows: number;
      outflows: number;
      closing_balance: number;
    }>;
    total_opening_balance: number;
    total_inflows: number;
    total_outflows: number;
    total_closing_balance: number;
  }> {
    try {
      const periodStart = new Date(query.period_start);
      const periodEnd = new Date(query.period_end);
      periodEnd.setHours(23, 59, 59, 999);

      const accounts: Array<{
        account_id: string;
        account_name: string;
        opening_balance: number;
        inflows: number;
        outflows: number;
        closing_balance: number;
      }> = [];

      // Get accounts to calculate
      let bankAccounts: BankAccount[] = [];
      let cashAccounts: CashAccount[] = [];

      if (query.account_ids && query.account_ids.length > 0) {
        bankAccounts = await this.bankAccountRepository.find({
          where: { id: query.account_ids[0] as any, isActive: true },
        });
        cashAccounts = await this.cashAccountRepository.find({
          where: { id: query.account_ids[0] as any, isActive: true },
        });
      } else {
        bankAccounts = await this.bankAccountRepository.find({ where: { isActive: true } });
        cashAccounts = await this.cashAccountRepository.find({ where: { isActive: true } });
      }

      let totalOpeningBalance = 0;
      let totalInflows = 0;
      let totalOutflows = 0;

      for (const account of [...bankAccounts, ...cashAccounts]) {
        const flows = await this.calculateAccountFlow(account.id, 'bank', periodStart, periodEnd);
        accounts.push({
          account_id: account.id,
          account_name: account.accountName,
          opening_balance: flows.openingBalance,
          inflows: flows.inflows,
          outflows: flows.outflows,
          closing_balance: flows.closingBalance,
        });
        totalOpeningBalance += flows.openingBalance;
        totalInflows += flows.inflows;
        totalOutflows += flows.outflows;
      }

      return {
        period_start: query.period_start,
        period_end: query.period_end,
        accounts: accounts,
        total_opening_balance: totalOpeningBalance,
        total_inflows: totalInflows,
        total_outflows: totalOutflows,
        total_closing_balance: totalOpeningBalance + totalInflows - totalOutflows,
      };
    } catch (error) {
      console.error('Error in CashFlowService.calculate:', error);
      throw error;
    }
  }

  private async calculateAccountFlow(
    accountId: string,
    accountType: 'bank' | 'cash',
    periodStart: Date,
    periodEnd: Date,
  ): Promise<{
    openingBalance: number;
    inflows: number;
    outflows: number;
    closingBalance: number;
  }> {
    // Get opening balance (balance before period start)
    const openingBalance = await this.calculateOpeningBalance(accountId, accountType, periodStart);

    // Get transactions in period
    const transactions = await this.bankTransactionRepository.find({
      where: {
        bankAccountId: accountId,
        transactionDate: Between(periodStart, periodEnd),
      },
    });

    let inflows = 0;
    let outflows = 0;

    for (const transaction of transactions) {
      const amount = typeof transaction.amount === 'number'
        ? transaction.amount
        : parseFloat(String(transaction.amount || '0')) || 0;

      if (transaction.transactionType === BankTransactionType.DEPOSIT || 
          transaction.transactionType === BankTransactionType.INTEREST) {
        inflows += amount;
      } else if (transaction.transactionType === BankTransactionType.WITHDRAWAL || 
                 transaction.transactionType === BankTransactionType.FEE) {
        outflows += amount;
      }
    }

    const closingBalance = openingBalance + inflows - outflows;

    return {
      openingBalance,
      inflows,
      outflows,
      closingBalance,
    };
  }

  private async calculateOpeningBalance(
    accountId: string,
    accountType: 'bank' | 'cash',
    beforeDate: Date,
  ): Promise<number> {
    if (accountType === 'bank') {
      const account = await this.bankAccountRepository.findOne({ where: { id: accountId } });
      if (!account) return 0;

      const openingBalance = typeof account.openingBalance === 'number'
        ? account.openingBalance
        : parseFloat(String(account.openingBalance || '0')) || 0;

      // Get all transactions before the period
      const transactions = await this.bankTransactionRepository.find({
        where: {
          bankAccountId: accountId,
          transactionDate: LessThanOrEqual(beforeDate),
        },
      });

      let balanceChange = 0;
      for (const transaction of transactions) {
        const amount = typeof transaction.amount === 'number'
          ? transaction.amount
          : parseFloat(String(transaction.amount || '0')) || 0;

        if (transaction.transactionType === BankTransactionType.DEPOSIT || 
            transaction.transactionType === BankTransactionType.INTEREST) {
          balanceChange += amount;
        } else if (transaction.transactionType === BankTransactionType.WITHDRAWAL || 
                   transaction.transactionType === BankTransactionType.FEE) {
          balanceChange -= amount;
        }
      }

      return openingBalance + balanceChange;
    } else {
      // Cash account - similar logic
      const account = await this.cashAccountRepository.findOne({ where: { id: accountId } });
      if (!account) return 0;

      const openingBalance = typeof account.openingBalance === 'number'
        ? account.openingBalance
        : parseFloat(String(account.openingBalance || '0')) || 0;

      // For cash accounts, we'd need cash transactions if they exist
      // For now, return opening balance
      return openingBalance;
    }
  }
}

