import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { JournalEntry } from '../journal-entries/entities/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-lines/entities/journal-entry-line.entity';
import { Account } from '../accounts/entities/account.entity';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly journalEntryLineRepository: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createBankAccountDto: CreateBankAccountDto): Promise<BankAccount> {
    try {
      // Validate required fields
      if (!createBankAccountDto.account_name) {
        throw new BadRequestException('account_name is required');
      }
      if (!createBankAccountDto.account_number) {
        throw new BadRequestException('account_number is required');
      }
      if (!createBankAccountDto.bank_name) {
        throw new BadRequestException('bank_name is required');
      }
      if (!createBankAccountDto.account_type) {
        throw new BadRequestException('account_type is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createBankAccountDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Check for duplicate account number within organization
      const existingAccount = await this.bankAccountRepository.findOne({
        where: {
          accountNumber: createBankAccountDto.account_number,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingAccount) {
        throw new ConflictException(`Bank account with number ${createBankAccountDto.account_number} already exists`);
      }

      const openingBalance = createBankAccountDto.opening_balance || 0;

      const bankAccount = this.bankAccountRepository.create({
        organizationId: organizationId,
        accountName: createBankAccountDto.account_name,
        accountNumber: createBankAccountDto.account_number,
        bankName: createBankAccountDto.bank_name,
        accountType: createBankAccountDto.account_type,
        currency: createBankAccountDto.currency || 'USD',
        openingBalance: openingBalance,
        currentBalance: openingBalance, // Initially current balance equals opening balance
        isActive: createBankAccountDto.is_active !== undefined ? createBankAccountDto.is_active : true,
      });

      return await this.bankAccountRepository.save(bankAccount);
    } catch (error) {
      console.error('Error in BankAccountsService.create:', error);
      throw error;
    }
  }

  async findAll(query: BankAccountPaginationDto): Promise<BankAccount[]> {
    try {
      const queryBuilder = this.bankAccountRepository
        .createQueryBuilder('bankAccount');

      if (query.is_active !== undefined) {
        queryBuilder.where('bankAccount.isActive = :isActive', { isActive: query.is_active });
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
          'account_name': 'accountName',
          'account_number': 'accountNumber',
          'bank_name': 'bankName',
          'account_type': 'accountType',
          'current_balance': 'currentBalance',
          'opening_balance': 'openingBalance',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`bankAccount.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('bankAccount.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('bankAccount.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('bankAccount.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in BankAccountsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
    });
    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }
    return bankAccount;
  }

  async getBalance(id: string, asOfDate?: string): Promise<{
    account_id: string;
    account_name: string;
    opening_balance: number;
    current_balance: number;
    as_of_date: string;
    reconciled_balance: number;
    unreconciled_transactions: number;
  }> {
    const bankAccount = await this.findOne(id);

    // Find the account linked to this bank account
    // For now, we'll use the bank account's ID to find related transactions
    // In a full implementation, you'd link bank accounts to chart of accounts

    const asOf = asOfDate ? new Date(asOfDate) : new Date();
    asOf.setHours(23, 59, 59, 999); // End of day

    // Calculate balance from journal entries
    // This is a simplified calculation - in production, you'd need to:
    // 1. Link bank accounts to chart of accounts
    // 2. Query journal entry lines for that account
    // 3. Calculate debits and credits up to asOfDate

    // For now, we'll return the current balance
    // TODO: Implement proper balance calculation from journal entries

    const openingBalance = bankAccount.openingBalance;
    const currentBalance = bankAccount.currentBalance;
    const reconciledBalance = currentBalance; // Placeholder - would need reconciliation logic
    const unreconciledTransactions = 0; // Placeholder - would need to count unreconciled transactions

    return {
      account_id: bankAccount.id,
      account_name: bankAccount.accountName,
      opening_balance: openingBalance,
      current_balance: currentBalance,
      as_of_date: asOfDate || new Date().toISOString().split('T')[0],
      reconciled_balance: reconciledBalance,
      unreconciled_transactions: unreconciledTransactions,
    };
  }

  async remove(id: string): Promise<void> {
    const bankAccount = await this.findOne(id);
    await this.bankAccountRepository.remove(bankAccount);
  }
}

