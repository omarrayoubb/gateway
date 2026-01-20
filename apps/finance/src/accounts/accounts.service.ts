import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountPaginationDto } from './dto/pagination.dto';


@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    try {
      // Validate required fields
      if (!createAccountDto.account_code) {
        throw new BadRequestException('account_code is required');
      }
      if (!createAccountDto.account_name) {
        throw new BadRequestException('account_name is required');
      }
      if (!createAccountDto.account_type) {
        throw new BadRequestException('account_type is required');
      }

      // organization_id is optional - can be null
      const organizationId = createAccountDto.organization_id || null;

      // Check for duplicate account code (within the same organization or globally if organization is null)
      const existingAccount = await this.accountRepository.findOne({
        where: {
          accountCode: createAccountDto.account_code,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });

      if (existingAccount) {
        throw new ConflictException(`Account with code ${createAccountDto.account_code} already exists for this organization`);
      }

      const account = this.accountRepository.create({
        organizationId: organizationId,
        accountCode: createAccountDto.account_code,
        accountName: createAccountDto.account_name,
        accountType: createAccountDto.account_type,
        accountSubtype: createAccountDto.account_subtype || null,
        description: createAccountDto.description || null,
        balance: createAccountDto.balance || 0,
        currency: createAccountDto.currency || 'USD',
        isActive: createAccountDto.is_active !== undefined ? createAccountDto.is_active : true,
      });

      const savedAccount = await this.accountRepository.save(account);
      return await this.findOne(savedAccount.id);
    } catch (error) {
      console.error('Error in AccountsService.create:', error);
      throw error;
    }
  }

  async findAll(paginationQuery: AccountPaginationDto): Promise<Account[]> {
    try {
      const { limit = 100, sort, filter } = paginationQuery;

      const queryBuilder = this.accountRepository
        .createQueryBuilder('account');

      // Handle filter - can be JSON string or simple string
      if (filter) {
        try {
          const filterObj = typeof filter === 'string' ? JSON.parse(filter) : filter;
          
          if (filterObj.account_type) {
            queryBuilder.where('account.accountType = :accountType', { accountType: filterObj.account_type });
          }
          
          if (filterObj.organization_id) {
            const whereCondition = filterObj.account_type ? 'andWhere' : 'where';
            queryBuilder[whereCondition]('account.organizationId = :organizationId', { organizationId: filterObj.organization_id });
          }
          
          if (filterObj.is_active !== undefined) {
            const whereCondition = filterObj.account_type || filterObj.organization_id ? 'andWhere' : 'where';
            queryBuilder[whereCondition]('account.isActive = :isActive', { isActive: filterObj.is_active });
          }
          
          if (filterObj.search) {
            const whereCondition = filterObj.account_type || filterObj.organization_id || filterObj.is_active !== undefined ? 'andWhere' : 'where';
            queryBuilder[whereCondition](
              '(account.accountCode ILIKE :search OR account.accountName ILIKE :search OR account.description ILIKE :search)',
              { search: `%${filterObj.search}%` }
            );
          }
        } catch (e) {
          // If filter is not JSON, treat it as a simple search
          queryBuilder.where(
            '(account.accountCode ILIKE :search OR account.accountName ILIKE :search OR account.description ILIKE :search)',
            { search: `%${filter}%` }
          );
        }
      }

      // Handle sort
      if (sort) {
        let sortField = sort;
        let sortOrder: 'ASC' | 'DESC' = 'ASC';
        
        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1);
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field;
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }
        
        if (sortField && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortField)) {
          try {
            queryBuilder.orderBy(`account.${sortField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('account.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('account.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('account.createdDate', 'DESC');
      }

      if (limit) {
        queryBuilder.take(limit);
      }

      const data = await queryBuilder.getMany();

      return data || [];
    } catch (error) {
      console.error('Error in AccountsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
    });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);

    if (updateAccountDto.account_code && updateAccountDto.account_code !== account.accountCode) {
      const checkOrganizationId = updateAccountDto.organization_id !== undefined 
        ? (updateAccountDto.organization_id || null)
        : account.organizationId;
      
      const existingAccount = await this.accountRepository.findOne({
        where: { 
          accountCode: updateAccountDto.account_code,
          organizationId: checkOrganizationId === null ? IsNull() : checkOrganizationId,
        },
      });
      if (existingAccount && existingAccount.id !== id) {
        throw new ConflictException(`Account with code ${updateAccountDto.account_code} already exists for this organization`);
      }
    }

    Object.assign(account, {
      organizationId: updateAccountDto.organization_id !== undefined ? updateAccountDto.organization_id : account.organizationId,
      accountCode: updateAccountDto.account_code !== undefined ? updateAccountDto.account_code : account.accountCode,
      accountName: updateAccountDto.account_name !== undefined ? updateAccountDto.account_name : account.accountName,
      accountType: updateAccountDto.account_type !== undefined ? updateAccountDto.account_type : account.accountType,
      accountSubtype: updateAccountDto.account_subtype !== undefined ? updateAccountDto.account_subtype : account.accountSubtype,
      description: updateAccountDto.description !== undefined ? updateAccountDto.description : account.description,
      balance: updateAccountDto.balance !== undefined ? updateAccountDto.balance : account.balance,
      currency: updateAccountDto.currency !== undefined ? updateAccountDto.currency : account.currency,
      isActive: updateAccountDto.is_active !== undefined ? updateAccountDto.is_active : account.isActive,
    });

    await this.accountRepository.save(account);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);
    await this.accountRepository.remove(account);
  }
}

