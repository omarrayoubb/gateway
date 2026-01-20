import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { AccruedExpense, AccruedExpenseStatus } from './entities/accrued-expense.entity';
import { CreateAccruedExpenseDto } from './dto/create-accrued-expense.dto';
import { UpdateAccruedExpenseDto } from './dto/update-accrued-expense.dto';
import { AccruedExpensePaginationDto } from './dto/pagination.dto';
import { ReverseAccruedExpenseDto } from './dto/reverse-accrued-expense.dto';
import { Account } from '../accounts/entities/account.entity';
import { AccountType } from '../accounts/entities/account.entity';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { EntryType } from '../journal-entries/entities/journal-entry.entity';

@Injectable()
export class AccruedExpensesService {
  constructor(
    @InjectRepository(AccruedExpense)
    private readonly accruedExpenseRepository: Repository<AccruedExpense>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateAccruedExpenseDto): Promise<AccruedExpense> {
    const organizationId = createDto.organization_id || null;

    // Generate accrual number if not provided
    let accrualNumber = createDto.accrual_number;
    if (!accrualNumber) {
      accrualNumber = await this.generateAccrualNumber(organizationId);
    }

    // Check for duplicate accrual number
    if (accrualNumber) {
      const existing = await this.accruedExpenseRepository.findOne({
        where: {
          accrualNumber,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });

      if (existing) {
        throw new BadRequestException(`Accrued expense with number ${accrualNumber} already exists`);
      }
    }

    // Validate account
    const account = await this.accountRepository.findOne({
      where: { id: createDto.account_id },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${createDto.account_id} not found`);
    }

    const accruedExpense = this.accruedExpenseRepository.create({
      organizationId,
      accrualNumber,
      expenseDescription: createDto.expense_description,
      accrualDate: new Date(createDto.accrual_date),
      amount: createDto.amount || 0,
      currency: createDto.currency || 'USD',
      accountId: createDto.account_id,
      vendorId: createDto.vendor_id || null,
      status: AccruedExpenseStatus.ACCRUED,
    });

    const saved = await this.accruedExpenseRepository.save(accruedExpense);

    // Create journal entry for accrual
    try {
      const expenseAccount = await this.accountRepository.findOne({
        where: { id: createDto.account_id },
      });

      if (!expenseAccount) {
        throw new BadRequestException('Expense account not found');
      }

      // Find or use a default Accrued Expenses Payable account
      const accruedPayableAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.LIABILITY,
          accountSubtype: 'Accrued Expenses',
        },
      });

      if (!accruedPayableAccount) {
        throw new BadRequestException('Accrued Expenses Payable account not found. Please create one first.');
      }

      const journalEntry = await this.journalEntriesService.create({
        organization_id: organizationId || undefined,
        entry_number: `ACC-${saved.accrualNumber || saved.id.substring(0, 8)}`,
        entry_date: createDto.accrual_date,
        entry_type: EntryType.ADJUSTMENT,
        description: `Accrued Expense: ${createDto.expense_description}`,
        reference: `ACC-${saved.accrualNumber || saved.id.substring(0, 8)}`,
        lines: [
          {
            account_id: expenseAccount.id,
            debit: saved.amount,
            credit: 0,
            description: `Accrued expense: ${createDto.expense_description}`,
          },
          {
            account_id: accruedPayableAccount.id,
            debit: 0,
            credit: saved.amount,
            description: `Accrued expense payable: ${createDto.expense_description}`,
          },
        ],
      });

      saved.journalEntryId = journalEntry.id;
      await this.accruedExpenseRepository.save(saved);
    } catch (error) {
      console.error('Error creating journal entry for accrued expense:', error);
      // Don't fail the accrual if journal entry creation fails
    }

    return saved;
  }

  async findAll(paginationDto: AccruedExpensePaginationDto): Promise<AccruedExpense[]> {
    const where: any = {};

    if (paginationDto.status) {
      where.status = paginationDto.status;
    }

    const queryBuilder = this.accruedExpenseRepository.createQueryBuilder('accrued').where(where);

    if (paginationDto.sort) {
      let sortField = paginationDto.sort.trim();
      let sortOrder: 'ASC' | 'DESC' = 'ASC';

      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1).trim();
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        const [field, order] = sortField.split(':');
        sortField = field.trim();
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      const mappedField = this.mapSortField(sortField);
      const validSortFields = ['accrualNumber', 'expenseDescription', 'accrualDate', 'amount', 'status', 'reversalDate', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`accrued.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('accrued.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('accrued.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<AccruedExpense> {
    const accruedExpense = await this.accruedExpenseRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!accruedExpense) {
      throw new NotFoundException(`Accrued expense with ID ${id} not found`);
    }

    return accruedExpense;
  }

  async update(id: string, updateDto: UpdateAccruedExpenseDto): Promise<AccruedExpense> {
    const accruedExpense = await this.findOne(id);

    if (accruedExpense.status === AccruedExpenseStatus.REVERSED) {
      throw new BadRequestException('Cannot update a reversed accrued expense');
    }

    if (updateDto.accrual_number && updateDto.accrual_number !== accruedExpense.accrualNumber) {
      const existing = await this.accruedExpenseRepository.findOne({
        where: { accrualNumber: updateDto.accrual_number },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Accrued expense with number ${updateDto.accrual_number} already exists`);
      }
    }

    Object.assign(accruedExpense, {
      ...(updateDto.accrual_number && { accrualNumber: updateDto.accrual_number }),
      ...(updateDto.expense_description && { expenseDescription: updateDto.expense_description }),
      ...(updateDto.accrual_date && { accrualDate: new Date(updateDto.accrual_date) }),
      ...(updateDto.amount !== undefined && { amount: updateDto.amount }),
      ...(updateDto.currency && { currency: updateDto.currency }),
      ...(updateDto.account_id && { accountId: updateDto.account_id }),
      ...(updateDto.vendor_id !== undefined && { vendorId: updateDto.vendor_id || null }),
      ...(updateDto.status && { status: updateDto.status }),
      ...(updateDto.reversal_date && { reversalDate: new Date(updateDto.reversal_date) }),
      ...(updateDto.reversal_reason && { reversalReason: updateDto.reversal_reason }),
    });

    return await this.accruedExpenseRepository.save(accruedExpense);
  }

  async remove(id: string): Promise<void> {
    const accruedExpense = await this.findOne(id);

    if (accruedExpense.status === AccruedExpenseStatus.REVERSED) {
      throw new BadRequestException('Cannot delete a reversed accrued expense');
    }

    await this.accruedExpenseRepository.remove(accruedExpense);
  }

  async reverse(id: string, reverseDto: ReverseAccruedExpenseDto): Promise<AccruedExpense> {
    const accruedExpense = await this.findOne(id);

    if (accruedExpense.status === AccruedExpenseStatus.REVERSED) {
      throw new BadRequestException('Accrued expense is already reversed');
    }

    if (accruedExpense.status === AccruedExpenseStatus.PAID) {
      throw new BadRequestException('Cannot reverse a paid accrued expense');
    }

    const reversalDate = new Date(reverseDto.reversal_date);

    // Create reversal journal entry
    try {
      if (!accruedExpense.accountId) {
        throw new BadRequestException('Accrued expense account ID is missing');
      }

      const expenseAccount = await this.accountRepository.findOne({
        where: { id: accruedExpense.accountId },
      });

      if (!expenseAccount) {
        throw new BadRequestException('Expense account not found');
      }

      const accruedPayableAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.LIABILITY,
          accountSubtype: 'Accrued Expenses',
        },
      });

      if (!accruedPayableAccount) {
        throw new BadRequestException('Accrued Expenses Payable account not found');
      }

      const reversalJournalEntry = await this.journalEntriesService.create({
        organization_id: accruedExpense.organizationId || undefined,
        entry_number: `ACC-REV-${accruedExpense.accrualNumber || accruedExpense.id.substring(0, 8)}`,
        entry_date: reverseDto.reversal_date,
        entry_type: EntryType.ADJUSTMENT,
        description: `Reversal of Accrued Expense: ${accruedExpense.expenseDescription}`,
        reference: `ACC-REV-${accruedExpense.accrualNumber || accruedExpense.id.substring(0, 8)}`,
        lines: [
          {
            account_id: expenseAccount.id,
            debit: 0,
            credit: accruedExpense.amount,
            description: `Reversal of accrued expense: ${accruedExpense.expenseDescription}`,
          },
          {
            account_id: accruedPayableAccount.id,
            debit: accruedExpense.amount,
            credit: 0,
            description: `Reversal of accrued expense payable: ${accruedExpense.expenseDescription}`,
          },
        ],
      });

      accruedExpense.reversalJournalEntryId = reversalJournalEntry.id;
    } catch (error) {
      console.error('Error creating reversal journal entry:', error);
      throw new BadRequestException('Failed to create reversal journal entry');
    }

    // Update accrued expense
    accruedExpense.status = AccruedExpenseStatus.REVERSED;
    accruedExpense.reversalDate = reversalDate;
    accruedExpense.reversalReason = reverseDto.reason || null;

    return await this.accruedExpenseRepository.save(accruedExpense);
  }

  private async generateAccrualNumber(organizationId: string | null): Promise<string> {
    const prefix = 'ACC';
    const year = new Date().getFullYear();
    const baseNumber = `${prefix}-${year}-`;

    const lastAccrual = await this.accruedExpenseRepository.findOne({
      where: {
        organizationId: organizationId === null ? IsNull() : organizationId,
        accrualNumber: Like(`${baseNumber}%`),
      },
      order: { accrualNumber: 'DESC' },
    });

    let sequence = 1;
    if (lastAccrual && lastAccrual.accrualNumber) {
      const lastSequence = parseInt(lastAccrual.accrualNumber.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    return `${baseNumber}${sequence.toString().padStart(6, '0')}`;
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'accrual_number': 'accrualNumber',
      'expense_description': 'expenseDescription',
      'accrual_date': 'accrualDate',
      'amount': 'amount',
      'reversal_date': 'reversalDate',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

