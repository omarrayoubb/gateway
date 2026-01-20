import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BankTransaction, BankTransactionType } from './entities/bank-transaction.entity';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { BankTransactionPaginationDto } from './dto/pagination.dto';
import { ImportBankTransactionsDto } from './dto/import-bank-transactions.dto';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class BankTransactionsService {
  constructor(
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepository: Repository<BankTransaction>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createTransactionDto: CreateBankTransactionDto): Promise<BankTransaction> {
    try {
      // Validate required fields
      if (!createTransactionDto.bank_account_id) {
        throw new BadRequestException('bank_account_id is required');
      }
      if (!createTransactionDto.transaction_date) {
        throw new BadRequestException('transaction_date is required');
      }
      if (!createTransactionDto.transaction_type) {
        throw new BadRequestException('transaction_type is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createTransactionDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Verify bank account exists
      const bankAccount = await this.bankAccountRepository.findOne({
        where: { id: createTransactionDto.bank_account_id },
      });
      if (!bankAccount) {
        throw new NotFoundException(`Bank account with ID ${createTransactionDto.bank_account_id} not found`);
      }

      const amount = createTransactionDto.amount || 0;

      // Update bank account balance based on transaction type
      let balanceChange = 0;
      switch (createTransactionDto.transaction_type) {
        case BankTransactionType.DEPOSIT:
        case BankTransactionType.INTEREST:
          balanceChange = amount;
          break;
        case BankTransactionType.WITHDRAWAL:
        case BankTransactionType.FEE:
          balanceChange = -amount;
          break;
        case BankTransactionType.TRANSFER:
          // Transfer balance change depends on direction (handled separately if needed)
          balanceChange = -amount; // Default: outgoing transfer
          break;
      }

      // Update bank account current balance - ensure both values are numbers
      const currentBalance = typeof bankAccount.currentBalance === 'number' 
        ? bankAccount.currentBalance 
        : parseFloat(String(bankAccount.currentBalance || '0')) || 0;
      const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || '0')) || 0;
      
      // Recalculate balanceChange with numeric values
      let numericBalanceChange = 0;
      switch (createTransactionDto.transaction_type) {
        case BankTransactionType.DEPOSIT:
        case BankTransactionType.INTEREST:
          numericBalanceChange = numericAmount;
          break;
        case BankTransactionType.WITHDRAWAL:
        case BankTransactionType.FEE:
          numericBalanceChange = -numericAmount;
          break;
        case BankTransactionType.TRANSFER:
          numericBalanceChange = -numericAmount; // Default: outgoing transfer
          break;
      }
      
      const newBalance = currentBalance + numericBalanceChange;
      bankAccount.currentBalance = newBalance;
      await this.bankAccountRepository.save(bankAccount);

      const transaction = this.bankTransactionRepository.create({
        organizationId: organizationId,
        bankAccountId: createTransactionDto.bank_account_id,
        bankAccountName: bankAccount.accountName,
        transactionDate: new Date(createTransactionDto.transaction_date),
        transactionType: createTransactionDto.transaction_type,
        amount: amount,
        currency: createTransactionDto.currency || bankAccount.currency || 'USD',
        reference: createTransactionDto.reference || null,
        description: createTransactionDto.description || null,
        category: createTransactionDto.category || null,
        isReconciled: false,
        reconciliationId: null,
      });

      return await this.bankTransactionRepository.save(transaction);
    } catch (error) {
      console.error('Error in BankTransactionsService.create:', error);
      throw error;
    }
  }

  async findAll(query: BankTransactionPaginationDto): Promise<BankTransaction[]> {
    try {
      const queryBuilder = this.bankTransactionRepository
        .createQueryBuilder('transaction');

      if (query.bank_account_id) {
        queryBuilder.where('transaction.bankAccountId = :bankAccountId', { 
          bankAccountId: query.bank_account_id 
        });
      }

      if (query.category) {
        const whereCondition = query.bank_account_id ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('transaction.category = :category', { category: query.category });
      }

      // Date range filtering
      if (query.date_from || query.date_to) {
        const whereCondition = query.bank_account_id || query.category ? 'andWhere' : 'where';
        if (query.date_from && query.date_to) {
          queryBuilder[whereCondition]('transaction.transactionDate BETWEEN :fromDate AND :toDate', {
            fromDate: query.date_from,
            toDate: query.date_to,
          });
        } else if (query.date_from) {
          queryBuilder[whereCondition]('transaction.transactionDate >= :fromDate', {
            fromDate: query.date_from,
          });
        } else if (query.date_to) {
          queryBuilder[whereCondition]('transaction.transactionDate <= :toDate', {
            toDate: query.date_to,
          });
        }
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
          'transaction_date': 'transactionDate',
          'amount': 'amount',
          'transaction_type': 'transactionType',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`transaction.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('transaction.transactionDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('transaction.transactionDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('transaction.transactionDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in BankTransactionsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<BankTransaction> {
    const transaction = await this.bankTransactionRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Bank transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async importTransactions(importDto: ImportBankTransactionsDto): Promise<{
    success: boolean;
    imported_count: number;
    errors: string[];
    transactions: BankTransaction[];
  }> {
    try {
      // Verify bank account exists
      const bankAccount = await this.bankAccountRepository.findOne({
        where: { id: importDto.bank_account_id },
      });
      if (!bankAccount) {
        throw new NotFoundException(`Bank account with ID ${importDto.bank_account_id} not found`);
      }

      // TODO: Implement actual file parsing based on file_format
      // This is a placeholder implementation
      // In production, you would:
      // 1. Download/read the file from file_url
      // 2. Parse based on file_format (CSV, OFX, QIF, Excel)
      // 3. Map columns using the mapping object
      // 4. Create transactions for each row/record
      // 5. Update bank account balances

      const errors: string[] = [];
      const transactions: BankTransaction[] = [];

      // Placeholder: Return success with 0 imported (actual implementation needed)
      return {
        success: true,
        imported_count: 0,
        errors: ['File import functionality not yet implemented. Please use individual transaction creation.'],
        transactions: [],
      };
    } catch (error) {
      console.error('Error in BankTransactionsService.importTransactions:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    
    // Reverse the balance change when deleting
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id: transaction.bankAccountId },
    });
    
    if (bankAccount) {
      // Ensure both values are numbers before calculation
      const currentBalance = typeof bankAccount.currentBalance === 'number' 
        ? bankAccount.currentBalance 
        : parseFloat(String(bankAccount.currentBalance || '0')) || 0;
      const transactionAmount = typeof transaction.amount === 'number'
        ? transaction.amount
        : parseFloat(String(transaction.amount || '0')) || 0;
      
      // Calculate balanceChange with numeric values (reverse the transaction)
      let numericBalanceChange = 0;
      switch (transaction.transactionType) {
        case BankTransactionType.DEPOSIT:
        case BankTransactionType.INTEREST:
          numericBalanceChange = -transactionAmount; // Reverse deposit
          break;
        case BankTransactionType.WITHDRAWAL:
        case BankTransactionType.FEE:
          numericBalanceChange = transactionAmount; // Reverse withdrawal
          break;
        case BankTransactionType.TRANSFER:
          numericBalanceChange = transactionAmount; // Reverse transfer
          break;
      }
      
      const newBalance = currentBalance + numericBalanceChange;
      bankAccount.currentBalance = newBalance;
      await this.bankAccountRepository.save(bankAccount);
    }
    
    await this.bankTransactionRepository.remove(transaction);
  }
}

