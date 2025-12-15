import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Account } from './entities/accounts.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { UserSync } from '../users/users-sync.entity';
import { AccountCreateResponse } from './dto/account-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateAccountDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

export interface PaginatedAccountsResult {
  data: AccountCreateResponse[]; 
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(UserSync)
    private readonly userSyncRepository: Repository<UserSync>,
  ) {}

  /**
   * Generates the next account number incrementally
   */
  private async generateAccountNumber(): Promise<string> {
    // Find all account numbers that are numeric
    const accounts = await this.accountRepository.find({
      select: ['accountNumber'],
    });

    // Filter to numeric account numbers and find max
    let maxNumber = 0;
    for (const account of accounts) {
      if (account.accountNumber && /^\d+$/.test(account.accountNumber)) {
        const num = parseInt(account.accountNumber, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    return nextNumber.toString().padStart(6, '0'); // Pad with zeros to 6 digits
  }

  /**
   * Creates a new account
   */
  async create(createAccountDto: CreateAccountDto, currentUser: any): Promise<AccountCreateResponse> {
    const existingAccount = await this.accountRepository.findOneBy({ 
      name: createAccountDto.name 
    });

    if (existingAccount) {
      throw new ConflictException(`Account with name ${createAccountDto.name} already exists`);
    }

    // Auto-generate account number if not provided or is 0/null/empty
    let accountNumber = createAccountDto.accountNumber;
    if (!accountNumber || accountNumber === '0' || accountNumber === '') {
      accountNumber = await this.generateAccountNumber();
    }

    // Check if account number already exists
    const existingAccountNumber = await this.accountRepository.findOneBy({
      accountNumber,
    });

    if (existingAccountNumber) {
      throw new ConflictException(`Account number ${accountNumber} already exists`);
    }

    // Prepare account data (exclude userIds as it's not a column)
    const { userIds, ...restDto } = createAccountDto;
    const accountData: Partial<Account> = {
      ...restDto,
      accountNumber,
      createdBy: currentUser.name,
      modifiedBy: currentUser.name,
    };

    // Handle ManyToMany users relationship
    // userIds is now required, so we always fetch the specified users from synced users
    const users = await this.userSyncRepository.findBy({
      id: In(createAccountDto.userIds),
    });

    if (users.length !== createAccountDto.userIds.length) {
      throw new NotFoundException('One or more user IDs not found');
    }

    const newAccount: Account = this.accountRepository.create(accountData);
    newAccount.users = users as any; // Type assertion since UserSync matches User structure

    const savedAccount: Account = await this.accountRepository.save(newAccount);

    // Reload the account with all relations
    const accountWithRelations = await this.getFullAccountById(savedAccount.id);

    // Transform to response format
    return this._transformAccountToResponse(accountWithRelations);
  }

  /**
   * Finds all accounts with pagination.
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedAccountsResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    // UPDATED: We now load all relations to provide the rich response
    // This is a heavy query, as requested.
    const [data, total] = await this.accountRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'users',
        'parentAccount',
        'contacts',
        'leads',
        'deals'
      ],
    });

    const lastPage = Math.ceil(total / limit);

    // Transform each account in the data array
    const transformedData = data.map((account) => 
      this._transformAccountToResponse(account)
    );

    return {
      data: transformedData, // <-- Return transformed data
      total,
      page,
      lastPage,
    };
  }
  

  /**
   * Finds a single account by its ID and transforms the response.
   */
  async findOne(id: string): Promise<AccountCreateResponse> {
    const account = await this.getFullAccountById(id);
    return this._transformAccountToResponse(account);
  }

  /**
   * Updates an existing account and returns the transformed response.
   */
  async update(
    id: string, 
    updateAccountDto: UpdateAccountDto, 
    currentUser: any
  ): Promise<AccountCreateResponse> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    // Handle ManyToMany users relationship update
    if (updateAccountDto.userIds) {
      const users = await this.userSyncRepository.findBy({
        id: In(updateAccountDto.userIds),
      });

      if (users.length !== updateAccountDto.userIds.length) {
        throw new NotFoundException('One or more user IDs not found');
      }

      account.users = users as any; // Type assertion since UserSync matches User structure
    }

    // Update other fields
    Object.assign(account, {
      ...updateAccountDto,
      modifiedBy: currentUser.name,
    });

    // Remove userIds from the account object before saving (it's not a column)
    delete (account as any).userIds;

    await this.accountRepository.save(account);

    // Find the updated account with all relations and transform it
    return this.findOne(id);
  }

  /**
   * Deletes an account
   */
  async remove(id: string): Promise<void> {
    // We can't use this.findOne(id) anymore as it returns a transformed response
    const account = await this.accountRepository.findOneBy({ id });
     if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    await this.accountRepository.remove(account);
  }

  /**
   * Bulk delete accounts
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all accounts that exist
    const accounts = await this.accountRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(accounts.map((a) => a.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Account not found' });
      }
    }

    // Delete all found accounts
    if (accounts.length > 0) {
      await this.accountRepository.remove(accounts);
      deletedCount = accounts.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update accounts - applies the same update fields to multiple accounts
   */
  async bulkUpdate(
    bulkUpdateDto: BulkUpdateAccountDto,
    currentUser: any,
  ): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all accounts that exist
    const accounts = await this.accountRepository.find({
      where: { id: In(ids) },
      relations: ['users'],
    });

    const foundIds = new Set(accounts.map((a) => a.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Account not found' });
      }
    }

    // Handle ManyToMany users relationship update if provided
    let usersToAssign: UserSync[] | null = null;
    if (updateFields.userIds) {
      usersToAssign = await this.userSyncRepository.findBy({
        id: In(updateFields.userIds),
      });

      if (usersToAssign.length !== updateFields.userIds.length) {
        // If user IDs are invalid, fail all updates
        return {
          updatedCount: 0,
          failedItems: ids.map((id) => ({
            id,
            error: 'One or more user IDs not found',
          })),
        };
      }
    }

    // Process each account
    for (const account of accounts) {
      try {
        // Handle ManyToMany users relationship update
        if (updateFields.userIds && usersToAssign) {
          account.users = usersToAssign as any; // Type assertion since UserSync matches User structure
        }

        // Update other fields
        Object.assign(account, {
          ...updateFields,
          modifiedBy: currentUser.name,
        });

        // Remove userIds from the account object before saving (it's not a column)
        delete (account as any).userIds;

        await this.accountRepository.save(account);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: account.id,
          error: error.message || 'Failed to update account',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  /**
   * Returns all accounts with id, name, and accountNumber for dropdown options.
   * Used by the orchestrator module to populate form dropdowns.
   */
  async findAllForDropdown(): Promise<{ id: string; name: string; accountNumber: string }[]> {
    const accounts = await this.accountRepository.find({
      select: ['id', 'name', 'accountNumber'],
      order: {
        name: 'ASC',
      },
    });

    return accounts.map(account => ({
      id: account.id,
      name: account.name,
      accountNumber: account.accountNumber,
    }));
  }

  // --- PRIVATE HELPER FUNCTIONS ---

  /**
   * Gets a single account by ID with all relations loaded.
   */
  private async getFullAccountById(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: [
        'leads', 
        'contacts', 
        'users',
        'deals',
        'parentAccount',
        'childAccounts'
      ]
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  /**
   * Transforms a full Account entity into the rich response format.
   */
  private _transformAccountToResponse(account: Account): AccountCreateResponse {
    return {
      // Base Account fields
      id: account.id,
      name: account.name,
      accountNumber: account.accountNumber,
      phone: account.phone,
      website: account.website,
      billing_street: account.billing_street,
      billing_city: account.billing_city,
      billing_state: account.billing_state,
      billing_zip: account.billing_zip,
      billing_country: account.billing_country,
      shipping_street: account.shipping_street,
      shipping_city: account.shipping_city,
      shipping_state: account.shipping_state,
      shipping_zip: account.shipping_zip,
      shipping_country: account.shipping_country,
      parentAccountId: account.parentAccountId,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,

      // Transformed fields
      Users: (account.users || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
      Contacts: (account.contacts || []).map(contact => ({
        id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
      })),
      Leads: (account.leads || []).map(lead => ({
        id: lead.id,
        first_name: lead.first_name,
        last_name: lead.last_name,
      })),
      Deals: (account.deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
      })),
      Created_by: account.createdBy || '',
      Modified_by: account.modifiedBy || '',
      parent_accounts: account.parentAccount ? {
        id: account.parentAccount.id,
        name: account.parentAccount.name,
        accountNumber: account.parentAccount.accountNumber,
      } : null,
    };
  }
}