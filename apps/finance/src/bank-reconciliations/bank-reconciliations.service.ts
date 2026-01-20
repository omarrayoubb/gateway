import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { BankReconciliation, BankReconciliationStatus } from './entities/bank-reconciliation.entity';
import { CreateBankReconciliationDto } from './dto/create-bank-reconciliation.dto';
import { BankReconciliationPaginationDto } from './dto/pagination.dto';
import { MatchTransactionsDto } from './dto/match-transactions.dto';
import { CompleteReconciliationDto } from './dto/complete-reconciliation.dto';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { BankTransaction, BankTransactionType } from '../bank-transactions/entities/bank-transaction.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class BankReconciliationsService {
  constructor(
    @InjectRepository(BankReconciliation)
    private readonly bankReconciliationRepository: Repository<BankReconciliation>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private readonly bankTransactionRepository: Repository<BankTransaction>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createReconciliationDto: CreateBankReconciliationDto): Promise<BankReconciliation> {
    try {
      // Validate required fields
      if (!createReconciliationDto.bank_account_id) {
        throw new BadRequestException('bank_account_id is required');
      }
      if (!createReconciliationDto.reconciliation_date) {
        throw new BadRequestException('reconciliation_date is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createReconciliationDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Verify bank account exists
      const bankAccount = await this.bankAccountRepository.findOne({
        where: { id: createReconciliationDto.bank_account_id },
      });
      if (!bankAccount) {
        throw new NotFoundException(`Bank account with ID ${createReconciliationDto.bank_account_id} not found`);
      }

      // Get book balance (current balance from bank account)
      const bookBalance = bankAccount.currentBalance || 0;
      const statementBalance = createReconciliationDto.statement_balance || bookBalance;

      // Calculate adjusted balance
      const outstandingDeposits = createReconciliationDto.outstanding_deposits || 0;
      const outstandingChecks = createReconciliationDto.outstanding_checks || 0;
      const bankCharges = createReconciliationDto.bank_charges || 0;
      const interestEarned = createReconciliationDto.interest_earned || 0;

      const adjustedBalance = statementBalance + outstandingDeposits - outstandingChecks - bankCharges + interestEarned;

      const reconciliation = this.bankReconciliationRepository.create({
        organizationId: organizationId,
        bankAccountId: createReconciliationDto.bank_account_id,
        bankAccountName: bankAccount.accountName,
        reconciliationDate: new Date(createReconciliationDto.reconciliation_date),
        statementBalance: statementBalance,
        bookBalance: bookBalance,
        adjustedBalance: adjustedBalance,
        status: BankReconciliationStatus.DRAFT,
        outstandingDeposits: outstandingDeposits,
        outstandingChecks: outstandingChecks,
        bankCharges: bankCharges,
        interestEarned: interestEarned,
        notes: createReconciliationDto.notes || null,
      });

      return await this.bankReconciliationRepository.save(reconciliation);
    } catch (error) {
      console.error('Error in BankReconciliationsService.create:', error);
      throw error;
    }
  }

  async findAll(query: BankReconciliationPaginationDto): Promise<BankReconciliation[]> {
    try {
      const queryBuilder = this.bankReconciliationRepository
        .createQueryBuilder('reconciliation');

      if (query.bank_account_id) {
        queryBuilder.where('reconciliation.bankAccountId = :bankAccountId', { 
          bankAccountId: query.bank_account_id 
        });
      }

      if (query.status) {
        const whereCondition = query.bank_account_id ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('reconciliation.status = :status', { status: query.status });
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
          'reconciliation_date': 'reconciliationDate',
          'statement_balance': 'statementBalance',
          'book_balance': 'bookBalance',
          'adjusted_balance': 'adjustedBalance',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`reconciliation.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('reconciliation.reconciliationDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('reconciliation.reconciliationDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('reconciliation.reconciliationDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in BankReconciliationsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<BankReconciliation> {
    const reconciliation = await this.bankReconciliationRepository.findOne({
      where: { id },
    });
    if (!reconciliation) {
      throw new NotFoundException(`Bank reconciliation with ID ${id} not found`);
    }
    return reconciliation;
  }

  async getUnmatched(id: string): Promise<{
    reconciliation_id: string;
    unmatched_transactions: Array<{
      transaction_id: string;
      transaction_date: string;
      amount: number;
      description: string;
      type: string;
    }>;
    unmatched_statement_items: Array<{
      date: string;
      amount: number;
      description: string;
      type: string;
    }>;
  }> {
    const reconciliation = await this.findOne(id);

    // Get all transactions for this bank account up to reconciliation date that are not reconciled
    const reconciliationDate = new Date(reconciliation.reconciliationDate);
    reconciliationDate.setHours(23, 59, 59, 999);

    const unmatchedTransactions = await this.bankTransactionRepository.find({
      where: {
        bankAccountId: reconciliation.bankAccountId,
        isReconciled: false,
      },
      order: {
        transactionDate: 'ASC',
      },
    });

    // Filter transactions up to reconciliation date
    const filteredTransactions = unmatchedTransactions.filter(t => {
      const tDate = new Date(t.transactionDate);
      return tDate <= reconciliationDate;
    });

    const unmatchedTransactionsList = filteredTransactions.map(t => ({
      transaction_id: t.id,
      transaction_date: t.transactionDate.toISOString().split('T')[0],
      amount: t.amount,
      description: t.description || t.reference || '',
      type: this.getTransactionTypeLabel(t.transactionType),
    }));

    // For unmatched statement items, we would need to store statement items separately
    // For now, return empty array - this would need to be implemented with a StatementItem entity
    const unmatchedStatementItems: Array<{
      date: string;
      amount: number;
      description: string;
      type: string;
    }> = [];

    return {
      reconciliation_id: id,
      unmatched_transactions: unmatchedTransactionsList,
      unmatched_statement_items: unmatchedStatementItems,
    };
  }

  async matchTransactions(matchDto: MatchTransactionsDto): Promise<BankReconciliation> {
    const reconciliation = await this.findOne(matchDto.reconciliation_id);

    if (reconciliation.status === BankReconciliationStatus.COMPLETED) {
      throw new BadRequestException('Cannot match transactions on a completed reconciliation');
    }

    // Update status to in_progress if it's draft
    if (reconciliation.status === BankReconciliationStatus.DRAFT) {
      reconciliation.status = BankReconciliationStatus.IN_PROGRESS;
    }

    // Mark transactions as reconciled
    for (const match of matchDto.matches) {
      const transaction = await this.bankTransactionRepository.findOne({
        where: { id: match.transaction_id },
      });

      if (transaction && transaction.bankAccountId === reconciliation.bankAccountId) {
        transaction.isReconciled = true;
        transaction.reconciliationId = reconciliation.id;
        await this.bankTransactionRepository.save(transaction);
      }
    }

    return await this.bankReconciliationRepository.save(reconciliation);
  }

  async complete(id: string, completeDto: CompleteReconciliationDto): Promise<BankReconciliation> {
    const reconciliation = await this.findOne(id);

    if (reconciliation.status === BankReconciliationStatus.COMPLETED) {
      throw new BadRequestException('Reconciliation is already completed');
    }

    reconciliation.status = BankReconciliationStatus.COMPLETED;
    if (completeDto.notes) {
      reconciliation.notes = completeDto.notes;
    }

    return await this.bankReconciliationRepository.save(reconciliation);
  }

  async remove(id: string): Promise<void> {
    const reconciliation = await this.findOne(id);
    
    // Unmark all transactions linked to this reconciliation
    await this.bankTransactionRepository.update(
      { reconciliationId: id },
      { isReconciled: false, reconciliationId: null }
    );
    
    await this.bankReconciliationRepository.remove(reconciliation);
  }

  private getTransactionTypeLabel(type: BankTransactionType): string {
    switch (type) {
      case BankTransactionType.DEPOSIT:
        return 'deposit';
      case BankTransactionType.WITHDRAWAL:
        return 'withdrawal';
      case BankTransactionType.TRANSFER:
        return 'withdrawal'; // Outgoing transfer
      case BankTransactionType.FEE:
        return 'withdrawal';
      case BankTransactionType.INTEREST:
        return 'deposit';
      default:
        return 'withdrawal';
    }
  }
}

