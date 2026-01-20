import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Cheque, ChequeType, ChequeStatus } from './entities/cheque.entity';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { ChequePaginationDto } from './dto/pagination.dto';
import { DepositChequeDto } from './dto/deposit-cheque.dto';
import { ClearChequeDto } from './dto/clear-cheque.dto';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class ChequesService {
  constructor(
    @InjectRepository(Cheque)
    private readonly chequeRepository: Repository<Cheque>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createChequeDto: CreateChequeDto): Promise<Cheque> {
    try {
      // Validate required fields
      if (!createChequeDto.cheque_number) {
        throw new BadRequestException('cheque_number is required');
      }
      if (!createChequeDto.type) {
        throw new BadRequestException('type is required');
      }
      if (!createChequeDto.cheque_date) {
        throw new BadRequestException('cheque_date is required');
      }
      if (!createChequeDto.payee_name) {
        throw new BadRequestException('payee_name is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createChequeDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Check for duplicate cheque number within organization
      const existingCheque = await this.chequeRepository.findOne({
        where: {
          chequeNumber: createChequeDto.cheque_number,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingCheque) {
        throw new ConflictException(`Cheque with number ${createChequeDto.cheque_number} already exists`);
      }

      // Verify bank account exists if provided
      let bankAccount: BankAccount | null = null;
      if (createChequeDto.bank_account_id) {
        bankAccount = await this.bankAccountRepository.findOne({
          where: { id: createChequeDto.bank_account_id },
        });
        if (!bankAccount) {
          throw new NotFoundException(`Bank account with ID ${createChequeDto.bank_account_id} not found`);
        }
      }

      const cheque = this.chequeRepository.create({
        organizationId: organizationId,
        chequeNumber: createChequeDto.cheque_number,
        type: createChequeDto.type,
        chequeDate: new Date(createChequeDto.cheque_date),
        amount: createChequeDto.amount || 0,
        currency: createChequeDto.currency || 'USD',
        payeeName: createChequeDto.payee_name,
        bankName: createChequeDto.bank_name || bankAccount?.bankName || null,
        status: ChequeStatus.PENDING,
        bankAccountId: createChequeDto.bank_account_id || null,
        depositDate: null,
        clearDate: null,
      });

      return await this.chequeRepository.save(cheque);
    } catch (error) {
      console.error('Error in ChequesService.create:', error);
      throw error;
    }
  }

  async findAll(query: ChequePaginationDto): Promise<Cheque[]> {
    try {
      const queryBuilder = this.chequeRepository
        .createQueryBuilder('cheque');

      if (query.type) {
        queryBuilder.where('cheque.type = :type', { type: query.type });
      }

      if (query.status) {
        const whereCondition = query.type ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('cheque.status = :status', { status: query.status });
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
          'cheque_number': 'chequeNumber',
          'cheque_date': 'chequeDate',
          'amount': 'amount',
          'deposit_date': 'depositDate',
          'clear_date': 'clearDate',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`cheque.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('cheque.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('cheque.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('cheque.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in ChequesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Cheque> {
    const cheque = await this.chequeRepository.findOne({
      where: { id },
    });
    if (!cheque) {
      throw new NotFoundException(`Cheque with ID ${id} not found`);
    }
    return cheque;
  }

  async deposit(id: string, depositDto: DepositChequeDto): Promise<Cheque> {
    const cheque = await this.findOne(id);

    if (cheque.type !== ChequeType.RECEIVED) {
      throw new BadRequestException('Only received cheques can be deposited');
    }

    if (cheque.status !== ChequeStatus.PENDING) {
      throw new BadRequestException(`Cannot deposit cheque with status ${cheque.status}`);
    }

    // Verify bank account exists
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id: depositDto.bank_account_id },
    });
    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${depositDto.bank_account_id} not found`);
    }

    const depositDate = depositDto.deposit_date ? new Date(depositDto.deposit_date) : new Date();

    cheque.status = ChequeStatus.DEPOSITED;
    cheque.bankAccountId = depositDto.bank_account_id;
    cheque.depositDate = depositDate;

    // Update bank account balance (deposit increases balance)
    const currentBalance = typeof bankAccount.currentBalance === 'number' 
      ? bankAccount.currentBalance 
      : parseFloat(String(bankAccount.currentBalance || '0')) || 0;
    const chequeAmount = typeof cheque.amount === 'number'
      ? cheque.amount
      : parseFloat(String(cheque.amount || '0')) || 0;
    
    const newBalance = currentBalance + chequeAmount;
    bankAccount.currentBalance = newBalance;
    await this.bankAccountRepository.save(bankAccount);

    return await this.chequeRepository.save(cheque);
  }

  async clear(id: string, clearDto: ClearChequeDto): Promise<Cheque> {
    const cheque = await this.findOne(id);

    if (cheque.status === ChequeStatus.CLEARED) {
      throw new BadRequestException('Cheque is already cleared');
    }

    if (cheque.status === ChequeStatus.BOUNCED) {
      throw new BadRequestException('Cannot clear a bounced cheque');
    }

    if (cheque.status === ChequeStatus.VOID) {
      throw new BadRequestException('Cannot clear a void cheque');
    }

    const clearDate = clearDto.clear_date ? new Date(clearDto.clear_date) : new Date();

    // If cheque was issued, update bank account balance when cleared
    if (cheque.type === ChequeType.ISSUED && cheque.bankAccountId) {
      const bankAccount = await this.bankAccountRepository.findOne({
        where: { id: cheque.bankAccountId },
      });

      if (bankAccount) {
        // For issued cheques, clearing means the money is actually withdrawn
        // If status was pending, we need to decrease balance
        if (cheque.status === ChequeStatus.PENDING) {
          const currentBalance = typeof bankAccount.currentBalance === 'number' 
            ? bankAccount.currentBalance 
            : parseFloat(String(bankAccount.currentBalance || '0')) || 0;
          const chequeAmount = typeof cheque.amount === 'number'
            ? cheque.amount
            : parseFloat(String(cheque.amount || '0')) || 0;
          
          const newBalance = currentBalance - chequeAmount;
          bankAccount.currentBalance = newBalance;
          await this.bankAccountRepository.save(bankAccount);
        }
      }
    }

    cheque.status = ChequeStatus.CLEARED;
    cheque.clearDate = clearDate;

    return await this.chequeRepository.save(cheque);
  }

  async remove(id: string): Promise<void> {
    const cheque = await this.findOne(id);
    
    // If cheque was deposited or cleared, reverse the bank account balance change
    if (cheque.status === ChequeStatus.DEPOSITED && cheque.bankAccountId && cheque.type === ChequeType.RECEIVED) {
      const bankAccount = await this.bankAccountRepository.findOne({
        where: { id: cheque.bankAccountId },
      });
      
      if (bankAccount) {
        const currentBalance = typeof bankAccount.currentBalance === 'number' 
          ? bankAccount.currentBalance 
          : parseFloat(String(bankAccount.currentBalance || '0')) || 0;
        const chequeAmount = typeof cheque.amount === 'number'
          ? cheque.amount
          : parseFloat(String(cheque.amount || '0')) || 0;
        
        const newBalance = currentBalance - chequeAmount; // Reverse deposit
        bankAccount.currentBalance = newBalance;
        await this.bankAccountRepository.save(bankAccount);
      }
    } else if (cheque.status === ChequeStatus.CLEARED && cheque.bankAccountId && cheque.type === ChequeType.ISSUED) {
      const bankAccount = await this.bankAccountRepository.findOne({
        where: { id: cheque.bankAccountId },
      });
      
      if (bankAccount) {
        const currentBalance = typeof bankAccount.currentBalance === 'number' 
          ? bankAccount.currentBalance 
          : parseFloat(String(bankAccount.currentBalance || '0')) || 0;
        const chequeAmount = typeof cheque.amount === 'number'
          ? cheque.amount
          : parseFloat(String(cheque.amount || '0')) || 0;
        
        const newBalance = currentBalance + chequeAmount; // Reverse withdrawal
        bankAccount.currentBalance = newBalance;
        await this.bankAccountRepository.save(bankAccount);
      }
    }
    
    await this.chequeRepository.remove(cheque);
  }
}

