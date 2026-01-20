import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensePaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { AccountsService } from '../accounts/accounts.service';
import { GeneralLedgerService } from '../general-ledger/general-ledger.service';
import { TransactionType } from '../general-ledger/entities/general-ledger.entity';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { EntryType, JournalEntryStatus } from '../journal-entries/entities/journal-entry.entity';
import { PostExpenseToGlDto } from './dto/post-to-gl.dto';
import { BulkPostExpensesToGlDto } from './dto/bulk-post-to-gl.dto';
import { Account, AccountType } from '../accounts/entities/account.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly organizationsService: OrganizationsService,
    private readonly accountsService: AccountsService,
    private readonly generalLedgerService: GeneralLedgerService,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    try {
      // Validate required fields
      if (!createExpenseDto.expense_date) {
        throw new BadRequestException('expense_date is required');
      }
      if (!createExpenseDto.category_id) {
        throw new BadRequestException('category_id is required');
      }
      if (!createExpenseDto.description) {
        throw new BadRequestException('description is required');
      }
      if (!createExpenseDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId = createExpenseDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Generate expense number if not provided
      let expenseNumber = createExpenseDto.expense_number;
      if (!expenseNumber) {
        expenseNumber = await this.generateExpenseNumber(organizationId);
      }

      // Check for duplicate expense numbers
      if (expenseNumber) {
        const existingExpense = await this.expenseRepository.findOne({
          where: {
            expenseNumber: expenseNumber,
            organizationId: organizationId === null ? IsNull() : organizationId,
          },
        });
        if (existingExpense) {
          throw new ConflictException(`Expense with number ${expenseNumber} already exists`);
        }
      }

      // Fetch account details
      const account = await this.accountsService.findOne(createExpenseDto.account_id);
      if (!account) {
        throw new NotFoundException(`Account with ID ${createExpenseDto.account_id} not found`);
      }

      // Create expense
      const expense = this.expenseRepository.create({
        organizationId: organizationId || null,
        expenseNumber: expenseNumber,
        employeeId: createExpenseDto.employee_id,
        employeeName: null, // Will be populated from employee service if available
        expenseDate: new Date(createExpenseDto.expense_date),
        categoryId: createExpenseDto.category_id,
        categoryName: null, // Will be populated from category service if available
        description: createExpenseDto.description,
        amount: createExpenseDto.amount || 0,
        currency: createExpenseDto.currency || 'USD',
        receiptUrl: createExpenseDto.receipt_url || null,
        status: ExpenseStatus.DRAFT,
        accountId: createExpenseDto.account_id,
        isPostedToGl: false,
      });

      return await this.expenseRepository.save(expense);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error in ExpensesService.create:', error);
      throw new BadRequestException(`Failed to create expense: ${error.message}`);
    }
  }

  async findAll(query: ExpensePaginationDto): Promise<{ expenses: Expense[]; total: number }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const queryBuilder = this.expenseRepository.createQueryBuilder('expense');

      // Apply filters
      if (query.status) {
        // Handle comma-separated status values (e.g., "draft,submitted")
        if (query.status.includes(',')) {
          const statuses = query.status.split(',').map(s => s.trim()).filter(s => s);
          if (statuses.length > 0) {
            queryBuilder.andWhere('expense.status IN (:...statuses)', { statuses });
          }
        } else {
          queryBuilder.andWhere('expense.status = :status', { status: query.status });
        }
      }

      if (query.employee_id) {
        queryBuilder.andWhere('expense.employeeId = :employeeId', { employeeId: query.employee_id });
      }

      if (query.category_id) {
        queryBuilder.andWhere('expense.categoryId = :categoryId', { categoryId: query.category_id });
      }

      // Apply sorting
      if (query.sort) {
        let sortField = query.sort.trim();
        let sortOrder: 'ASC' | 'DESC' = 'ASC';

        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1).trim();
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field.trim();
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }

        const fieldMap: { [key: string]: string } = {
          'expense_date': 'expenseDate',
          'expense_number': 'expenseNumber',
          'amount': 'amount',
          'status': 'status',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`expense.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('expense.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('expense.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('expense.createdDate', 'DESC');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      const expenses = await queryBuilder.getMany();

      return { expenses, total };
    } catch (error) {
      console.error('Error in ExpensesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot update a paid expense');
    }

    if (expense.isPostedToGl && expense.status === ExpenseStatus.APPROVED) {
      throw new BadRequestException('Cannot update an expense that has been posted to General Ledger');
    }

    // Update fields
    if (updateExpenseDto.organization_id !== undefined) expense.organizationId = updateExpenseDto.organization_id;
    if (updateExpenseDto.expense_number !== undefined) expense.expenseNumber = updateExpenseDto.expense_number;
    if (updateExpenseDto.employee_id !== undefined) expense.employeeId = updateExpenseDto.employee_id;
    if (updateExpenseDto.expense_date !== undefined) expense.expenseDate = new Date(updateExpenseDto.expense_date);
    if (updateExpenseDto.category_id !== undefined) expense.categoryId = updateExpenseDto.category_id;
    if (updateExpenseDto.description !== undefined) expense.description = updateExpenseDto.description;
    if (updateExpenseDto.amount !== undefined) expense.amount = updateExpenseDto.amount;
    if (updateExpenseDto.currency !== undefined) expense.currency = updateExpenseDto.currency;
    if (updateExpenseDto.receipt_url !== undefined) expense.receiptUrl = updateExpenseDto.receipt_url;
    if (updateExpenseDto.status !== undefined) expense.status = updateExpenseDto.status;
    if (updateExpenseDto.account_id !== undefined) {
      // Validate account exists
      const account = await this.accountsService.findOne(updateExpenseDto.account_id);
      if (!account) {
        throw new NotFoundException(`Account with ID ${updateExpenseDto.account_id} not found`);
      }
      expense.accountId = updateExpenseDto.account_id;
    }

    return await this.expenseRepository.save(expense);
  }

  async approve(id: string): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status === ExpenseStatus.APPROVED) {
      throw new BadRequestException('Expense is already approved');
    }

    if (expense.status === ExpenseStatus.REJECTED) {
      throw new BadRequestException('Cannot approve a rejected expense');
    }

    if (expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Expense is already paid');
    }

    expense.status = ExpenseStatus.APPROVED;
    const savedExpense = await this.expenseRepository.save(expense);

    // Sync to general ledger when approved
    try {
      await this.generalLedgerService.syncExpenseToLedger(
        savedExpense.id,
        savedExpense.expenseDate,
        savedExpense.amount,
        savedExpense.accountId || undefined,
      );
      savedExpense.isPostedToGl = true;
      await this.expenseRepository.save(savedExpense);
    } catch (error) {
      console.error('Error syncing expense to general ledger:', error);
      // Don't fail the approve operation if ledger sync fails
    }

    return await this.findOne(id);
  }

  async reject(id: string, reason?: string): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expense.status === ExpenseStatus.REJECTED) {
      throw new BadRequestException('Expense is already rejected');
    }

    if (expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot reject a paid expense');
    }

    expense.status = ExpenseStatus.REJECTED;
    if (reason) {
      expense.description = expense.description ? `${expense.description}\nRejected: ${reason}` : `Rejected: ${reason}`;
    }

    return await this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);

    if (expense.status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid expense');
    }

    // Remove from general ledger if it was synced
    if (expense.isPostedToGl) {
      try {
        await this.generalLedgerService.removeTransactionFromLedger(id, TransactionType.EXPENSE);
      } catch (error) {
        console.error('Error removing expense from general ledger:', error);
        // Continue with deletion even if ledger removal fails
      }
    }

    await this.expenseRepository.remove(expense);
  }

  async postToGl(id: string, postDto: PostExpenseToGlDto): Promise<{ journalEntryId: string }> {
    const expense = await this.findOne(id);

    if (expense.isPostedToGl) {
      throw new BadRequestException('Expense is already posted to General Ledger');
    }

    if (expense.status !== ExpenseStatus.APPROVED) {
      throw new BadRequestException('Expense must be approved before posting to General Ledger');
    }

    if (!expense.accountId) {
      throw new BadRequestException('Expense must have an account_id before posting to General Ledger');
    }

    // Get expense account
    const expenseAccount = await this.accountsService.findOne(expense.accountId);
    if (!expenseAccount) {
      throw new NotFoundException(`Expense account with ID ${expense.accountId} not found`);
    }

    // Find or use default Cash account
    let cashAccountId: string | null = null;
    let cashAccount: Account | null = null;

    // Try to find cash account by subtype
    cashAccount = await this.accountRepository.findOne({
      where: { accountSubtype: 'cash', isActive: true },
    });

    if (!cashAccount) {
      // Try to find any asset account
      cashAccount = await this.accountRepository.findOne({
        where: { accountType: AccountType.ASSET, isActive: true },
      });
    }

    if (!cashAccount) {
      throw new BadRequestException('No Cash or Asset account found. Please create a cash account first.');
    }

    cashAccountId = cashAccount.id;

    // Generate journal entry number
    const postingDate = postDto.posting_date ? new Date(postDto.posting_date) : expense.expenseDate;
    const year = postingDate.getFullYear();
    const month = String(postingDate.getMonth() + 1).padStart(2, '0');
    const day = String(postingDate.getDate()).padStart(2, '0');
    const journalEntryNumber = postDto.journal_entry_reference || `JE-EXP-${year}${month}${day}-${expense.expenseNumber || expense.id.substring(0, 8)}`;

    // Create journal entry
    const journalEntry = await this.journalEntriesService.create({
      organization_id: expense.organizationId || undefined,
      entry_number: journalEntryNumber,
      entry_date: postingDate.toISOString().split('T')[0],
      entry_type: EntryType.MANUAL,
      reference: postDto.journal_entry_reference || expense.expenseNumber || undefined,
      description: `Expense posting: ${expense.description}`,
      status: JournalEntryStatus.DRAFT,
      notes: `Posted from expense ${expense.expenseNumber || expense.id}`,
      lines: [
        {
          account_id: expense.accountId,
          description: expense.description,
          debit: parseFloat(expense.amount.toString()),
          credit: 0,
        },
        {
          account_id: cashAccountId,
          description: `Payment for expense ${expense.expenseNumber || expense.id}`,
          debit: 0,
          credit: parseFloat(expense.amount.toString()),
        },
      ],
    });

    // Post the journal entry
    const postedEntry = await this.journalEntriesService.post(journalEntry.id);

    // Mark expense as posted
    expense.isPostedToGl = true;
    await this.expenseRepository.save(expense);

    return { journalEntryId: postedEntry.id };
  }

  async bulkPostToGl(bulkPostDto: BulkPostExpensesToGlDto): Promise<{
    success: boolean;
    postedCount: number;
    errors: Array<{ expenseId: string; error: string }>;
    journalEntryId?: string;
  }> {
    const results = {
      success: true,
      postedCount: 0,
      errors: [] as Array<{ expenseId: string; error: string }>,
      journalEntryId: undefined as string | undefined,
    };

    // Find or use default Cash account
    let cashAccountId: string | null = null;
    let cashAccount: Account | null = null;

    // Try to find cash account by subtype
    cashAccount = await this.accountRepository.findOne({
      where: { accountSubtype: 'cash', isActive: true },
    });

    if (!cashAccount) {
      // Try to find any asset account
      cashAccount = await this.accountRepository.findOne({
        where: { accountType: AccountType.ASSET, isActive: true },
      });
    }

    if (!cashAccount) {
      throw new BadRequestException('No Cash or Asset account found. Please create a cash account first.');
    }

    cashAccountId = cashAccount.id;

    const postingDate = new Date(bulkPostDto.posting_date);
    const year = postingDate.getFullYear();
    const month = String(postingDate.getMonth() + 1).padStart(2, '0');
    const day = String(postingDate.getDate()).padStart(2, '0');
    const journalEntryNumber = `JE-EXP-BULK-${year}${month}${day}-${Date.now()}`;

    // Fetch all expenses
    const expenses: Expense[] = [];
    for (const expenseId of bulkPostDto.expense_ids) {
      try {
        const expense = await this.findOne(expenseId);
        if (expense.isPostedToGl) {
          results.errors.push({
            expenseId,
            error: 'Expense is already posted to General Ledger',
          });
          continue;
        }
        if (expense.status !== ExpenseStatus.APPROVED) {
          results.errors.push({
            expenseId,
            error: 'Expense must be approved before posting to General Ledger',
          });
          continue;
        }
        if (!expense.accountId) {
          results.errors.push({
            expenseId,
            error: 'Expense must have an account_id before posting to General Ledger',
          });
          continue;
        }
        expenses.push(expense);
      } catch (error) {
        results.errors.push({
          expenseId,
          error: error.message || 'Failed to fetch expense',
        });
      }
    }

    if (expenses.length === 0) {
      return results;
    }

    // Create journal entry lines for all expenses
    const lines: Array<{ account_id: string; description: string; debit: number; credit: number }> = [];
    const expenseAccountMap = new Map<string, number>();

    for (const expense of expenses) {
      // Aggregate by expense account
      const accountId = expense.accountId!;
      const amount = parseFloat(expense.amount.toString());
      const currentTotal = expenseAccountMap.get(accountId) || 0;
      expenseAccountMap.set(accountId, currentTotal + amount);
    }

    // Create debit lines for expense accounts
    for (const [accountId, totalAmount] of expenseAccountMap.entries()) {
      lines.push({
        account_id: accountId,
        description: `Bulk expense posting`,
        debit: totalAmount,
        credit: 0,
      });
    }

    // Create credit line for cash account
    const totalAmount = Array.from(expenseAccountMap.values()).reduce((sum, amount) => sum + amount, 0);
    lines.push({
      account_id: cashAccountId,
      description: `Bulk expense payment`,
      debit: 0,
      credit: totalAmount,
    });

    // Get organization ID from first expense
    const organizationId = expenses[0].organizationId;

    // Create journal entry
    try {
      const journalEntry = await this.journalEntriesService.create({
        organization_id: organizationId || undefined,
        entry_number: journalEntryNumber,
        entry_date: bulkPostDto.posting_date,
        entry_type: EntryType.MANUAL,
        reference: journalEntryNumber,
        description: `Bulk expense posting for ${expenses.length} expense(s)`,
        status: JournalEntryStatus.DRAFT,
        notes: `Bulk posted ${expenses.length} expenses`,
        lines,
      });

      // Post the journal entry
      const postedEntry = await this.journalEntriesService.post(journalEntry.id);
      results.journalEntryId = postedEntry.id;

      // Mark all expenses as posted
      for (const expense of expenses) {
        expense.isPostedToGl = true;
        await this.expenseRepository.save(expense);
        results.postedCount++;
      }
    } catch (error) {
      results.success = false;
      results.errors.push({
        expenseId: 'bulk',
        error: error.message || 'Failed to create journal entry',
      });
    }

    return results;
  }

  private async generateExpenseNumber(organizationId: string | null): Promise<string> {
    const prefix = 'EXP';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.expenseNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('expense.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('expense.organizationId IS NULL');
    }

    queryBuilder.orderBy('expense.expenseNumber', 'DESC').limit(1);

    const lastExpense = await queryBuilder.getOne();

    let sequence = 1;
    if (lastExpense && lastExpense.expenseNumber) {
      const parts = lastExpense.expenseNumber.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}

