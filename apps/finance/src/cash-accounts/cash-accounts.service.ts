import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CashAccount } from './entities/cash-account.entity';
import { CreateCashAccountDto } from './dto/create-cash-account.dto';
import { CashAccountPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class CashAccountsService {
  constructor(
    @InjectRepository(CashAccount)
    private readonly cashAccountRepository: Repository<CashAccount>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createCashAccountDto: CreateCashAccountDto): Promise<CashAccount> {
    try {
      // Validate required fields
      if (!createCashAccountDto.account_name) {
        throw new BadRequestException('account_name is required');
      }
      if (!createCashAccountDto.account_code) {
        throw new BadRequestException('account_code is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createCashAccountDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Check for duplicate account code within organization
      const existingAccount = await this.cashAccountRepository.findOne({
        where: {
          accountCode: createCashAccountDto.account_code,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingAccount) {
        throw new ConflictException(`Cash account with code ${createCashAccountDto.account_code} already exists`);
      }

      const openingBalance = createCashAccountDto.opening_balance || 0;

      const cashAccount = this.cashAccountRepository.create({
        organizationId: organizationId,
        accountName: createCashAccountDto.account_name,
        accountCode: createCashAccountDto.account_code,
        location: createCashAccountDto.location || null,
        currency: createCashAccountDto.currency || 'USD',
        openingBalance: openingBalance,
        currentBalance: openingBalance, // Initially current balance equals opening balance
        isActive: createCashAccountDto.is_active !== undefined ? createCashAccountDto.is_active : true,
      });

      return await this.cashAccountRepository.save(cashAccount);
    } catch (error) {
      console.error('Error in CashAccountsService.create:', error);
      throw error;
    }
  }

  async findAll(query: CashAccountPaginationDto): Promise<CashAccount[]> {
    try {
      const queryBuilder = this.cashAccountRepository
        .createQueryBuilder('cashAccount');

      if (query.is_active !== undefined) {
        queryBuilder.where('cashAccount.isActive = :isActive', { isActive: query.is_active });
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
          'account_code': 'accountCode',
          'location': 'location',
          'current_balance': 'currentBalance',
          'opening_balance': 'openingBalance',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`cashAccount.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('cashAccount.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('cashAccount.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('cashAccount.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in CashAccountsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CashAccount> {
    const cashAccount = await this.cashAccountRepository.findOne({
      where: { id },
    });
    if (!cashAccount) {
      throw new NotFoundException(`Cash account with ID ${id} not found`);
    }
    return cashAccount;
  }

  async remove(id: string): Promise<void> {
    const cashAccount = await this.findOne(id);
    await this.cashAccountRepository.remove(cashAccount);
  }
}

