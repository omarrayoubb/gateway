import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { GeneralLedger, TransactionType } from './entities/general-ledger.entity';
import { Account, AccountType } from '../accounts/entities/account.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-lines/entities/journal-entry-line.entity';
import { GeneralLedgerQueryDto, GeneralLedgerAccountQueryDto, GeneralLedgerReportQueryDto } from './dto/general-ledger-query.dto';

@Injectable()
export class GeneralLedgerService {
  constructor(
    @InjectRepository(GeneralLedger)
    private readonly generalLedgerRepository: Repository<GeneralLedger>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(JournalEntryLine)
    private readonly journalEntryLineRepository: Repository<JournalEntryLine>,
  ) {}

  async findAll(query: GeneralLedgerQueryDto): Promise<GeneralLedger[]> {
    try {
      const queryBuilder = this.generalLedgerRepository
        .createQueryBuilder('ledger')
        .leftJoinAndSelect('ledger.account', 'account');

      if (query.account_id) {
        queryBuilder.where('ledger.accountId = :accountId', { accountId: query.account_id });
      }

      if (query.period_start && query.period_end) {
        const whereCondition = query.account_id ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('ledger.transactionDate BETWEEN :start AND :end', {
          start: query.period_start,
          end: query.period_end,
        });
      } else if (query.period_start) {
        const whereCondition = query.account_id ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('ledger.transactionDate >= :start', {
          start: query.period_start,
        });
      } else if (query.period_end) {
        const whereCondition = query.account_id ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('ledger.transactionDate <= :end', {
          end: query.period_end,
        });
      }

      if (query.sort) {
        let sortField = query.sort;
        let sortOrder: 'ASC' | 'DESC' = 'ASC';
        
        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1);
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field;
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }
        
        const fieldMap: { [key: string]: string } = {
          'transaction_date': 'transactionDate',
          'account_id': 'accountId',
          'transaction_type': 'transactionType',
          'transaction_id': 'transactionId',
        };
        
        const entityField = fieldMap[sortField] || sortField;
        
        if (entityField && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`ledger.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('ledger.transactionDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('ledger.transactionDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('ledger.transactionDate', 'DESC');
      }

      const entries = await queryBuilder.getMany();

      // Group entries by account for balance calculation
      const accountGroups = new Map<string, GeneralLedger[]>();
      const accountIds = new Set<string>();
      
      entries.forEach(entry => {
        const accountId = entry.accountId;
        accountIds.add(accountId);
        if (!accountGroups.has(accountId)) {
          accountGroups.set(accountId, []);
        }
        accountGroups.get(accountId)!.push(entry);
      });

      // Calculate opening balances for all accounts
      const accountBalances = new Map<string, number>();
      
      for (const accountId of accountIds) {
        const account = entries.find(e => e.accountId === accountId)?.account;
        if (account) {
          let openingBalance = parseFloat(account.balance.toString());
          
          // If period_start is provided, calculate opening balance
          if (query.period_start) {
            // Get all transactions from period_start to now for this account
            const futureTransactions = await this.generalLedgerRepository.find({
              where: {
                accountId: accountId,
                transactionDate: MoreThanOrEqual(new Date(query.period_start)),
              },
            });
            
            // Subtract future transactions to get opening balance
            for (const trans of futureTransactions) {
              openingBalance = openingBalance - parseFloat(trans.debit.toString()) + parseFloat(trans.credit.toString());
            }
          }
          
          accountBalances.set(accountId, openingBalance);
        } else {
          accountBalances.set(accountId, 0);
        }
      }

      // Calculate running balances per account (must be done in chronological order)
      const entriesWithBalanceMap = new Map<string, GeneralLedger[]>();
      
      for (const [accountId, accountEntries] of accountGroups) {
        // Sort entries by date for this account
        const sortedAccountEntries = [...accountEntries].sort((a, b) => {
          const dateA = a.transactionDate instanceof Date ? a.transactionDate : new Date(a.transactionDate);
          const dateB = b.transactionDate instanceof Date ? b.transactionDate : new Date(b.transactionDate);
          return dateA.getTime() - dateB.getTime();
        });
        
        let runningBalance = accountBalances.get(accountId) || 0;
        
        const entriesWithBalance = sortedAccountEntries.map(entry => {
          const debit = parseFloat(entry.debit.toString());
          const credit = parseFloat(entry.credit.toString());
          runningBalance = runningBalance + debit - credit;
          
          return {
            ...entry,
            balance: runningBalance,
          };
        });
        
        entriesWithBalanceMap.set(accountId, entriesWithBalance);
      }

      // Flatten back to single array
      const allEntriesWithBalance: GeneralLedger[] = [];
      for (const [accountId, accountEntries] of entriesWithBalanceMap) {
        allEntriesWithBalance.push(...accountEntries);
      }

      // Apply user's sort if specified
      if (query.sort) {
        let sortField = query.sort;
        let sortOrder: 'ASC' | 'DESC' = 'ASC';
        
        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1);
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field;
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }
        
        const fieldMap: { [key: string]: string } = {
          'transaction_date': 'transactionDate',
          'account_id': 'accountId',
          'transaction_type': 'transactionType',
          'transaction_id': 'transactionId',
        };
        
        const entityField = fieldMap[sortField] || sortField;
        
        if (entityField) {
          allEntriesWithBalance.sort((a, b) => {
            let aVal: any = a[entityField];
            let bVal: any = b[entityField];
            
            if (aVal instanceof Date) aVal = aVal.getTime();
            if (bVal instanceof Date) bVal = bVal.getTime();
            
            if (aVal < bVal) return sortOrder === 'ASC' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'ASC' ? 1 : -1;
            return 0;
          });
        }
      }

      return allEntriesWithBalance;
    } catch (error) {
      console.error('Error in GeneralLedgerService.findAll:', error);
      throw error;
    }
  }

  async getAccountLedger(accountId: string, query: GeneralLedgerAccountQueryDto): Promise<any> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      const queryBuilder = this.generalLedgerRepository
        .createQueryBuilder('ledger')
        .where('ledger.accountId = :accountId', { accountId });

      if (query.period_start && query.period_end) {
        queryBuilder.andWhere('ledger.transactionDate BETWEEN :start AND :end', {
          start: query.period_start,
          end: query.period_end,
        });
      } else if (query.period_start) {
        queryBuilder.andWhere('ledger.transactionDate >= :start', {
          start: query.period_start,
        });
      } else if (query.period_end) {
        queryBuilder.andWhere('ledger.transactionDate <= :end', {
          end: query.period_end,
        });
      }

      queryBuilder.orderBy('ledger.transactionDate', 'ASC');

      const transactions = await queryBuilder.getMany();

      // Calculate opening balance
      // Opening balance = current account balance - all transactions from period_start to now
      let openingBalance = parseFloat(account.balance.toString());
      if (query.period_start) {
        const futureTransactions = await this.generalLedgerRepository.find({
          where: {
            accountId: accountId,
            transactionDate: MoreThanOrEqual(new Date(query.period_start)),
          },
        });

        // Subtract future transactions to get opening balance
        for (const trans of futureTransactions) {
          openingBalance = openingBalance - parseFloat(trans.debit.toString()) + parseFloat(trans.credit.toString());
        }
      }

      // Calculate totals
      let totalDebits = 0;
      let totalCredits = 0;
      let runningBalance = openingBalance;

      const transactionsWithBalance = transactions.map(trans => {
        const debit = parseFloat(trans.debit.toString());
        const credit = parseFloat(trans.credit.toString());
        totalDebits += debit;
        totalCredits += credit;
        runningBalance = runningBalance + debit - credit;

        return {
          ...trans,
          balance: runningBalance,
        };
      });

      return {
        account: {
          id: account.id,
          account_code: account.accountCode,
          account_name: account.accountName,
          account_type: account.accountType,
        },
        opening_balance: openingBalance,
        closing_balance: runningBalance,
        transactions: transactionsWithBalance,
        summary: {
          total_debits: totalDebits,
          total_credits: totalCredits,
          net_change: totalDebits - totalCredits,
        },
      };
    } catch (error) {
      console.error('Error in GeneralLedgerService.getAccountLedger:', error);
      throw error;
    }
  }

  async getReport(query: GeneralLedgerReportQueryDto): Promise<any> {
    try {
      // Validate required parameters - check for both undefined and empty strings
      if (!query.period_start || query.period_start.trim() === '') {
        throw new BadRequestException('period_start is required and cannot be empty');
      }
      if (!query.period_end || query.period_end.trim() === '') {
        throw new BadRequestException('period_end is required and cannot be empty');
      }

      const accountQueryBuilder = this.accountRepository.createQueryBuilder('account');

      if (query.account_type) {
        accountQueryBuilder.where('account.accountType = :accountType', {
          accountType: query.account_type,
        });
      }

      const accounts = await accountQueryBuilder.getMany();

      const reportAccounts: Array<{
        account_code: string;
        account_name: string;
        opening_balance: number;
        debits: number;
        credits: number;
        closing_balance: number;
      }> = [];
      let totalDebits = 0;
      let totalCredits = 0;

      for (const account of accounts) {
        const ledgerEntries = await this.generalLedgerRepository.find({
          where: {
            accountId: account.id,
            transactionDate: Between(new Date(query.period_start), new Date(query.period_end)),
          },
          order: { transactionDate: 'ASC' },
        });

        // Calculate opening balance
        // Opening balance = current account balance - all transactions from period_start to now
        const futureTransactions = await this.generalLedgerRepository.find({
          where: {
            accountId: account.id,
            transactionDate: MoreThanOrEqual(new Date(query.period_start)),
          },
        });

        let openingBalance = parseFloat(account.balance.toString());
        for (const trans of futureTransactions) {
          openingBalance = openingBalance - parseFloat(trans.debit.toString()) + parseFloat(trans.credit.toString());
        }

        // Calculate period totals
        let debits = 0;
        let credits = 0;
        for (const entry of ledgerEntries) {
          debits += parseFloat(entry.debit.toString());
          credits += parseFloat(entry.credit.toString());
        }

        const closingBalance = openingBalance + debits - credits;
        totalDebits += debits;
        totalCredits += credits;

        reportAccounts.push({
          account_code: account.accountCode,
          account_name: account.accountName,
          opening_balance: openingBalance,
          debits: debits,
          credits: credits,
          closing_balance: closingBalance,
        });
      }

      return {
        period_start: query.period_start,
        period_end: query.period_end,
        accounts: reportAccounts,
        totals: {
          total_debits: totalDebits,
          total_credits: totalCredits,
        },
      };
    } catch (error) {
      console.error('Error in GeneralLedgerService.getReport:', error);
      throw error;
    }
  }

  // Method to sync journal entry lines to general ledger
  async syncJournalEntryToLedger(journalEntryId: string, entryDate: Date): Promise<void> {
    try {
      if (!journalEntryId) {
        throw new Error('Journal entry ID is required');
      }

      if (!entryDate) {
        throw new Error('Entry date is required');
      }

      const lines = await this.journalEntryLineRepository.find({
        where: { journalEntryId },
        relations: ['journalEntry'],
      });

      if (!lines || lines.length === 0) {
        console.warn(`No lines found for journal entry ${journalEntryId}. Skipping ledger sync.`);
        return;
      }

      for (const line of lines) {
        if (!line.accountId) {
          console.warn(`Line ${line.id} has no accountId. Skipping.`);
          continue;
        }

        // Ensure debit and credit are numbers
        const debit = typeof line.debit === 'number' ? line.debit : parseFloat(String(line.debit || '0'));
        const credit = typeof line.credit === 'number' ? line.credit : parseFloat(String(line.credit || '0'));

        // Check if ledger entry already exists
        const existing = await this.generalLedgerRepository.findOne({
          where: {
            transactionId: journalEntryId,
            accountId: line.accountId,
            transactionType: TransactionType.JOURNAL_ENTRY,
          },
        });

        if (existing) {
          // Update existing entry
          existing.debit = debit;
          existing.credit = credit;
          existing.transactionDate = entryDate instanceof Date ? entryDate : new Date(entryDate);
          existing.reference = line.journalEntry?.entryNumber || null;
          existing.description = line.description || null;
          await this.generalLedgerRepository.save(existing);
        } else {
          // Create new ledger entry
          const ledgerEntry = this.generalLedgerRepository.create({
            accountId: line.accountId,
            transactionDate: entryDate instanceof Date ? entryDate : new Date(entryDate),
            transactionType: TransactionType.JOURNAL_ENTRY,
            transactionId: journalEntryId,
            reference: line.journalEntry?.entryNumber || null,
            description: line.description || null,
            debit: debit,
            credit: credit,
            balance: 0, // Will be calculated when viewing
          });

          await this.generalLedgerRepository.save(ledgerEntry);
        }
      }
    } catch (error) {
      console.error('Error syncing journal entry to ledger:', error);
      throw error;
    }
  }

  // Method to remove ledger entries for a journal entry (when voided/deleted)
  async removeJournalEntryFromLedger(journalEntryId: string): Promise<void> {
    try {
      await this.generalLedgerRepository.delete({
        transactionId: journalEntryId,
        transactionType: TransactionType.JOURNAL_ENTRY,
      });
    } catch (error) {
      console.error('Error removing journal entry from ledger:', error);
      throw error;
    }
  }

  // Method to sync invoice to general ledger
  async syncInvoiceToLedger(invoiceId: string, invoiceDate: Date, totalAmount: number, revenueAccountId?: string, accountsReceivableAccountId?: string): Promise<void> {
    try {
      // Find or use default Accounts Receivable account
      let arAccountId = accountsReceivableAccountId;
      if (!arAccountId) {
        const arAccount = await this.accountRepository.findOne({
          where: { accountSubtype: 'accounts_receivable', isActive: true },
        });
        if (arAccount) {
          arAccountId = arAccount.id;
        } else {
          // Try to find any asset account as fallback
          const assetAccount = await this.accountRepository.findOne({
            where: { accountType: 'asset' as any, isActive: true },
          });
          if (assetAccount) {
            arAccountId = assetAccount.id;
          } else {
            console.warn('No Accounts Receivable account found for invoice sync');
            return;
          }
        }
      }

      // Find or use default Revenue account
      let revenueAccount = revenueAccountId;
      if (!revenueAccount) {
        const revAccount = await this.accountRepository.findOne({
          where: { accountType: 'revenue' as any, isActive: true },
        });
        if (revAccount) {
          revenueAccount = revAccount.id;
        } else {
          console.warn('No Revenue account found for invoice sync');
          return;
        }
      }

      // Check if ledger entry already exists
      const existing = await this.generalLedgerRepository.findOne({
        where: {
          transactionId: invoiceId,
          transactionType: TransactionType.INVOICE,
        },
      });

      if (existing) {
        // Update existing entry
        existing.debit = totalAmount;
        existing.credit = 0;
        existing.transactionDate = invoiceDate;
        existing.accountId = arAccountId;
        await this.generalLedgerRepository.save(existing);

        // Update or create revenue entry
        const existingRevenue = await this.generalLedgerRepository.findOne({
          where: {
            transactionId: invoiceId,
            accountId: revenueAccount,
            transactionType: TransactionType.INVOICE,
          },
        });
        if (existingRevenue) {
          existingRevenue.credit = totalAmount;
          existingRevenue.debit = 0;
          await this.generalLedgerRepository.save(existingRevenue);
        } else {
          const revenueEntry = this.generalLedgerRepository.create({
            accountId: revenueAccount,
            transactionDate: invoiceDate,
            transactionType: TransactionType.INVOICE,
            transactionId: invoiceId,
            reference: `INV-${invoiceId.substring(0, 8)}`,
            description: `Invoice revenue`,
            debit: 0,
            credit: totalAmount,
            balance: 0,
          });
          await this.generalLedgerRepository.save(revenueEntry);
        }
      } else {
        // Create Accounts Receivable entry (Debit)
        const arEntry = this.generalLedgerRepository.create({
          accountId: arAccountId,
          transactionDate: invoiceDate,
          transactionType: TransactionType.INVOICE,
          transactionId: invoiceId,
          reference: `INV-${invoiceId.substring(0, 8)}`,
          description: `Invoice receivable`,
          debit: totalAmount,
          credit: 0,
          balance: 0,
        });
        await this.generalLedgerRepository.save(arEntry);

        // Create Revenue entry (Credit)
        const revenueEntry = this.generalLedgerRepository.create({
          accountId: revenueAccount,
          transactionDate: invoiceDate,
          transactionType: TransactionType.INVOICE,
          transactionId: invoiceId,
          reference: `INV-${invoiceId.substring(0, 8)}`,
          description: `Invoice revenue`,
          debit: 0,
          credit: totalAmount,
          balance: 0,
        });
        await this.generalLedgerRepository.save(revenueEntry);
      }
    } catch (error) {
      console.error('Error syncing invoice to ledger:', error);
      throw error;
    }
  }

  // Method to sync purchase bill to general ledger
  async syncPurchaseBillToLedger(billId: string, billDate: Date, items: Array<{ accountId: string | null; amount: number }>, accountsPayableAccountId?: string): Promise<void> {
    try {
      // Find or use default Accounts Payable account
      let apAccountId = accountsPayableAccountId;
      if (!apAccountId) {
        const apAccount = await this.accountRepository.findOne({
          where: { accountSubtype: 'accounts_payable', isActive: true },
        });
        if (apAccount) {
          apAccountId = apAccount.id;
        } else {
          // Try to find any liability account as fallback
          const liabilityAccount = await this.accountRepository.findOne({
            where: { accountType: 'liability' as any, isActive: true },
          });
          if (liabilityAccount) {
            apAccountId = liabilityAccount.id;
          } else {
            console.warn('No Accounts Payable account found for bill sync');
            return;
          }
        }
      }

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

      // Remove existing entries
      await this.generalLedgerRepository.delete({
        transactionId: billId,
        transactionType: TransactionType.BILL,
      });

      // Create expense entries for each item (Debit)
      for (const item of items) {
        if (item.accountId && item.amount > 0) {
          const expenseEntry = this.generalLedgerRepository.create({
            accountId: item.accountId,
            transactionDate: billDate,
            transactionType: TransactionType.BILL,
            transactionId: billId,
            reference: `BILL-${billId.substring(0, 8)}`,
            description: `Purchase bill expense`,
            debit: item.amount,
            credit: 0,
            balance: 0,
          });
          await this.generalLedgerRepository.save(expenseEntry);
        }
      }

      // Create Accounts Payable entry (Credit)
      if (totalAmount > 0) {
        const apEntry = this.generalLedgerRepository.create({
          accountId: apAccountId,
          transactionDate: billDate,
          transactionType: TransactionType.BILL,
          transactionId: billId,
          reference: `BILL-${billId.substring(0, 8)}`,
          description: `Purchase bill payable`,
          debit: 0,
          credit: totalAmount,
          balance: 0,
        });
        await this.generalLedgerRepository.save(apEntry);
      }
    } catch (error) {
      console.error('Error syncing purchase bill to ledger:', error);
      throw error;
    }
  }

  // Method to sync customer payment to general ledger
  async syncCustomerPaymentToLedger(paymentId: string, paymentDate: Date, amount: number, bankAccountId?: string, accountsReceivableAccountId?: string): Promise<void> {
    try {
      // Find or use default Accounts Receivable account
      let arAccountId = accountsReceivableAccountId;
      if (!arAccountId) {
        const arAccount = await this.accountRepository.findOne({
          where: { accountSubtype: 'accounts_receivable', isActive: true },
        });
        if (arAccount) {
          arAccountId = arAccount.id;
        } else {
          const assetAccount = await this.accountRepository.findOne({
            where: { accountType: 'asset' as any, isActive: true },
          });
          if (assetAccount) {
            arAccountId = assetAccount.id;
          } else {
            console.warn('No Accounts Receivable account found for payment sync');
            return;
          }
        }
      }

      // Use bank account if provided, otherwise find default cash account
      let cashAccountId = bankAccountId;
      if (!cashAccountId) {
        const cashAccount = await this.accountRepository.findOne({
          where: { accountSubtype: 'cash', isActive: true },
        });
        if (cashAccount) {
          cashAccountId = cashAccount.id;
        } else {
          const assetAccount = await this.accountRepository.findOne({
            where: { accountType: 'asset' as any, isActive: true },
          });
          if (assetAccount) {
            cashAccountId = assetAccount.id;
          } else {
            console.warn('No Cash/Bank account found for payment sync');
            return;
          }
        }
      }

      // Check if ledger entry already exists
      const existing = await this.generalLedgerRepository.findOne({
        where: {
          transactionId: paymentId,
          transactionType: TransactionType.PAYMENT,
        },
      });

      if (existing) {
        // Update existing entries
        const cashEntry = await this.generalLedgerRepository.findOne({
          where: {
            transactionId: paymentId,
            accountId: cashAccountId,
            transactionType: TransactionType.PAYMENT,
          },
        });
        if (cashEntry) {
          cashEntry.debit = amount;
          cashEntry.credit = 0;
          await this.generalLedgerRepository.save(cashEntry);
        }

        const arEntry = await this.generalLedgerRepository.findOne({
          where: {
            transactionId: paymentId,
            accountId: arAccountId,
            transactionType: TransactionType.PAYMENT,
          },
        });
        if (arEntry) {
          arEntry.credit = amount;
          arEntry.debit = 0;
          await this.generalLedgerRepository.save(arEntry);
        }
      } else {
        // Create Cash/Bank entry (Debit)
        const cashEntry = this.generalLedgerRepository.create({
          accountId: cashAccountId,
          transactionDate: paymentDate,
          transactionType: TransactionType.PAYMENT,
          transactionId: paymentId,
          reference: `PAY-${paymentId.substring(0, 8)}`,
          description: `Customer payment received`,
          debit: amount,
          credit: 0,
          balance: 0,
        });
        await this.generalLedgerRepository.save(cashEntry);

        // Create Accounts Receivable entry (Credit)
        const arEntry = this.generalLedgerRepository.create({
          accountId: arAccountId,
          transactionDate: paymentDate,
          transactionType: TransactionType.PAYMENT,
          transactionId: paymentId,
          reference: `PAY-${paymentId.substring(0, 8)}`,
          description: `Customer payment applied`,
          debit: 0,
          credit: amount,
          balance: 0,
        });
        await this.generalLedgerRepository.save(arEntry);
      }
    } catch (error) {
      console.error('Error syncing customer payment to ledger:', error);
      throw error;
    }
  }

  // Method to sync vendor payment to general ledger
  async syncVendorPaymentToLedger(paymentId: string, paymentDate: Date, amount: number, bankAccountId?: string, accountsPayableAccountId?: string): Promise<void> {
    try {
      // Find or use default Accounts Payable account
      let apAccountId = accountsPayableAccountId;
      if (!apAccountId) {
        const apAccount = await this.accountRepository.findOne({
          where: { accountSubtype: 'accounts_payable', isActive: true },
        });
        if (apAccount) {
          apAccountId = apAccount.id;
        } else {
          const liabilityAccount = await this.accountRepository.findOne({
            where: { accountType: 'liability' as any, isActive: true },
          });
          if (liabilityAccount) {
            apAccountId = liabilityAccount.id;
          } else {
            console.warn('No Accounts Payable account found for payment sync');
            return;
          }
        }
      }

      // Use bank account if provided, otherwise find default cash account
      let cashAccountId = bankAccountId;
      if (!cashAccountId) {
        const cashAccount = await this.accountRepository.findOne({
          where: { accountSubtype: 'cash', isActive: true },
        });
        if (cashAccount) {
          cashAccountId = cashAccount.id;
        } else {
          const assetAccount = await this.accountRepository.findOne({
            where: { accountType: 'asset' as any, isActive: true },
          });
          if (assetAccount) {
            cashAccountId = assetAccount.id;
          } else {
            console.warn('No Cash/Bank account found for payment sync');
            return;
          }
        }
      }

      // Check if ledger entry already exists
      const existing = await this.generalLedgerRepository.findOne({
        where: {
          transactionId: paymentId,
          transactionType: TransactionType.PAYMENT,
        },
      });

      if (existing) {
        // Update existing entries
        const apEntry = await this.generalLedgerRepository.findOne({
          where: {
            transactionId: paymentId,
            accountId: apAccountId,
            transactionType: TransactionType.PAYMENT,
          },
        });
        if (apEntry) {
          apEntry.debit = amount;
          apEntry.credit = 0;
          await this.generalLedgerRepository.save(apEntry);
        }

        const cashEntry = await this.generalLedgerRepository.findOne({
          where: {
            transactionId: paymentId,
            accountId: cashAccountId,
            transactionType: TransactionType.PAYMENT,
          },
        });
        if (cashEntry) {
          cashEntry.credit = amount;
          cashEntry.debit = 0;
          await this.generalLedgerRepository.save(cashEntry);
        }
      } else {
        // Create Accounts Payable entry (Debit)
        const apEntry = this.generalLedgerRepository.create({
          accountId: apAccountId,
          transactionDate: paymentDate,
          transactionType: TransactionType.PAYMENT,
          transactionId: paymentId,
          reference: `VPAY-${paymentId.substring(0, 8)}`,
          description: `Vendor payment applied`,
          debit: amount,
          credit: 0,
          balance: 0,
        });
        await this.generalLedgerRepository.save(apEntry);

        // Create Cash/Bank entry (Credit)
        const cashEntry = this.generalLedgerRepository.create({
          accountId: cashAccountId,
          transactionDate: paymentDate,
          transactionType: TransactionType.PAYMENT,
          transactionId: paymentId,
          reference: `VPAY-${paymentId.substring(0, 8)}`,
          description: `Vendor payment made`,
          debit: 0,
          credit: amount,
          balance: 0,
        });
        await this.generalLedgerRepository.save(cashEntry);
      }
    } catch (error) {
      console.error('Error syncing vendor payment to ledger:', error);
      throw error;
    }
  }

  // Method to sync expense to general ledger
  async syncExpenseToLedger(expenseId: string, expenseDate: Date, amount: number, expenseAccountId?: string, cashAccountId?: string): Promise<void> {
    try {
      if (!expenseId) {
        throw new Error('Expense ID is required');
      }

      if (!expenseDate) {
        throw new Error('Expense date is required');
      }

      if (!expenseAccountId) {
        console.warn(`Expense ${expenseId} has no account_id. Skipping ledger sync.`);
        return;
      }

      // Use provided expense account or find default expense account
      let expenseAccount = expenseAccountId;
      if (!expenseAccount) {
        const expAccount = await this.accountRepository.findOne({
          where: { accountType: 'expense' as any, isActive: true },
        });
        if (expAccount) {
          expenseAccount = expAccount.id;
        } else {
          console.warn('No Expense account found for expense sync');
          return;
        }
      }

      // Find or use default Cash account
      let cashAccount = cashAccountId;
      if (!cashAccount) {
        const cashAcc = await this.accountRepository.findOne({
          where: { accountSubtype: 'cash', isActive: true },
        });
        if (cashAcc) {
          cashAccount = cashAcc.id;
        } else {
          const assetAccount = await this.accountRepository.findOne({
            where: { accountType: 'asset' as any, isActive: true },
          });
          if (assetAccount) {
            cashAccount = assetAccount.id;
          } else {
            console.warn('No Cash account found for expense sync');
            return;
          }
        }
      }

      // Ensure amount is a number
      const expenseAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || '0'));

      // Remove existing entries
      await this.generalLedgerRepository.delete({
        transactionId: expenseId,
        transactionType: TransactionType.EXPENSE,
      });

      // Create Expense entry (Debit)
      const expenseEntry = this.generalLedgerRepository.create({
        accountId: expenseAccount,
        transactionDate: expenseDate instanceof Date ? expenseDate : new Date(expenseDate),
        transactionType: TransactionType.EXPENSE,
        transactionId: expenseId,
        reference: `EXP-${expenseId.substring(0, 8)}`,
        description: `Expense`,
        debit: expenseAmount,
        credit: 0,
        balance: 0,
      });
      await this.generalLedgerRepository.save(expenseEntry);

      // Create Cash entry (Credit)
      const cashEntry = this.generalLedgerRepository.create({
        accountId: cashAccount,
        transactionDate: expenseDate instanceof Date ? expenseDate : new Date(expenseDate),
        transactionType: TransactionType.EXPENSE,
        transactionId: expenseId,
        reference: `EXP-${expenseId.substring(0, 8)}`,
        description: `Expense payment`,
        debit: 0,
        credit: expenseAmount,
        balance: 0,
      });
      await this.generalLedgerRepository.save(cashEntry);
    } catch (error) {
      console.error('Error syncing expense to ledger:', error);
      throw error;
    }
  }

  // Method to remove transaction from ledger
  async removeTransactionFromLedger(transactionId: string, transactionType: TransactionType): Promise<void> {
    try {
      await this.generalLedgerRepository.delete({
        transactionId: transactionId,
        transactionType: transactionType,
      });
    } catch (error) {
      console.error(`Error removing ${transactionType} from ledger:`, error);
      throw error;
    }
  }
}
