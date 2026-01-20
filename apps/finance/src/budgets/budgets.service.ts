import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Budget, PeriodType, BudgetStatus } from './entities/budget.entity';
import { BudgetPeriod } from './budget-periods/entities/budget-period.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(BudgetPeriod)
    private readonly budgetPeriodRepository: Repository<BudgetPeriod>,
    private readonly organizationsService: OrganizationsService,
    private readonly accountsService: AccountsService,
  ) {}

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    try {
      // Auto-fetch organization_id if not provided
      let organizationId = createBudgetDto.organization_id;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Auto-select account if not provided
      let accountId = createBudgetDto.account_id;
      if (!accountId) {
        // Get the first available account as default
        const accounts = await this.accountsService.findAll({ limit: 1 });
        if (accounts && accounts.length > 0) {
          accountId = accounts[0].id;
        } else {
          throw new BadRequestException('No accounts available. Please create an account first.');
        }
      }

      // Fetch account details
      const account = await this.accountsService.findOne(accountId);
      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      // Calculate total budget amount from periods if provided
      let budgetAmount = createBudgetDto.budget_amount || 0;
      if (createBudgetDto.periods && createBudgetDto.periods.length > 0) {
        budgetAmount = createBudgetDto.periods.reduce((sum, period) => sum + (period.amount || 0), 0);
      }

      // Create budget
      const budget = this.budgetRepository.create({
        organizationId: organizationId || null,
        budgetName: createBudgetDto.budget_name,
        fiscalYear: createBudgetDto.fiscal_year,
        periodType: createBudgetDto.period_type as PeriodType,
        department: createBudgetDto.department || null,
        projectId: createBudgetDto.project_id || null,
        accountId: accountId,
        accountCode: account.accountCode || null,
        accountName: account.accountName || null,
        budgetAmount: budgetAmount,
        currency: createBudgetDto.currency || 'USD',
        status: (createBudgetDto.status as BudgetStatus) || BudgetStatus.DRAFT,
      });

      const savedBudget = await this.budgetRepository.save(budget);

      // Create budget periods if provided
      if (createBudgetDto.periods && createBudgetDto.periods.length > 0) {
        const periods = createBudgetDto.periods.map((periodDto) =>
          this.budgetPeriodRepository.create({
            budgetId: savedBudget.id,
            period: periodDto.period,
            amount: periodDto.amount,
          }),
        );
        await this.budgetPeriodRepository.save(periods);
      }

      // Reload budget with periods
      const reloadedBudget = await this.budgetRepository.findOne({
        where: { id: savedBudget.id },
        relations: ['periods'],
      });

      if (!reloadedBudget) {
        throw new BadRequestException('Failed to reload created budget');
      }

      return reloadedBudget;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create budget: ${error.message}`);
    }
  }

  async findAll(query: BudgetPaginationDto): Promise<{ budgets: Budget[]; total: number }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const queryBuilder = this.budgetRepository.createQueryBuilder('budget');

      // Apply filters
      if (query.fiscal_year) {
        queryBuilder.andWhere('budget.fiscalYear = :fiscalYear', { fiscalYear: query.fiscal_year });
      }

      if (query.department) {
        queryBuilder.andWhere('budget.department = :department', { department: query.department });
      }

      if (query.project_id) {
        queryBuilder.andWhere('budget.projectId = :projectId', { projectId: query.project_id });
      }

      // Apply sorting
      if (query.sort) {
        const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
        const sortOrder = query.sort.startsWith('-') ? 'DESC' : 'ASC';
        const validSortFields = ['created_date', 'budget_name', 'fiscal_year', 'budget_amount'];
        const fieldMap: { [key: string]: string } = {
          created_date: 'budget.createdDate',
          budget_name: 'budget.budgetName',
          fiscal_year: 'budget.fiscalYear',
          budget_amount: 'budget.budgetAmount',
        };

        if (validSortFields.includes(sortField) && fieldMap[sortField]) {
          queryBuilder.orderBy(fieldMap[sortField], sortOrder as 'ASC' | 'DESC');
        } else {
          queryBuilder.orderBy('budget.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('budget.createdDate', 'DESC');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Get paginated results
      const budgets = await queryBuilder
        .leftJoinAndSelect('budget.periods', 'periods')
        .skip(skip)
        .take(limit)
        .getMany();

      return { budgets, total };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch budgets: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Budget> {
    try {
      const budget = await this.budgetRepository.findOne({
        where: { id },
        relations: ['periods'],
      });

      if (!budget) {
        throw new NotFoundException(`Budget with ID ${id} not found`);
      }

      return budget;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch budget: ${error.message}`);
    }
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    try {
      const budget = await this.budgetRepository.findOne({
        where: { id },
        relations: ['periods'],
      });

      if (!budget) {
        throw new NotFoundException(`Budget with ID ${id} not found`);
      }

      // Update account details if account_id is provided
      if (updateBudgetDto.account_id && updateBudgetDto.account_id !== budget.accountId) {
        const account = await this.accountsService.findOne(updateBudgetDto.account_id);
        if (!account) {
          throw new NotFoundException(`Account with ID ${updateBudgetDto.account_id} not found`);
        }
        budget.accountId = updateBudgetDto.account_id;
        budget.accountCode = account.accountCode || null;
        budget.accountName = account.accountName || null;
      }

      // Update other fields
      if (updateBudgetDto.organization_id !== undefined) {
        budget.organizationId = updateBudgetDto.organization_id || null;
      }
      if (updateBudgetDto.budget_name !== undefined) {
        budget.budgetName = updateBudgetDto.budget_name;
      }
      if (updateBudgetDto.fiscal_year !== undefined) {
        budget.fiscalYear = updateBudgetDto.fiscal_year;
      }
      if (updateBudgetDto.period_type !== undefined) {
        budget.periodType = updateBudgetDto.period_type as PeriodType;
      }
      if (updateBudgetDto.department !== undefined) {
        budget.department = updateBudgetDto.department || null;
      }
      if (updateBudgetDto.project_id !== undefined) {
        budget.projectId = updateBudgetDto.project_id || null;
      }
      if (updateBudgetDto.currency !== undefined) {
        budget.currency = updateBudgetDto.currency;
      }
      if (updateBudgetDto.status !== undefined) {
        budget.status = updateBudgetDto.status as BudgetStatus;
      }

      // Calculate total budget amount from periods if provided
      if (updateBudgetDto.periods && updateBudgetDto.periods.length > 0) {
        const budgetAmount = updateBudgetDto.periods.reduce((sum, period) => sum + (period.amount || 0), 0);
        budget.budgetAmount = budgetAmount;
      } else if (updateBudgetDto.budget_amount !== undefined) {
        budget.budgetAmount = updateBudgetDto.budget_amount;
      }

      // Update periods if provided
      if (updateBudgetDto.periods !== undefined) {
        // Delete existing periods
        await this.budgetPeriodRepository.delete({ budgetId: id });

        // Create new periods
        if (updateBudgetDto.periods.length > 0) {
          const periods = updateBudgetDto.periods.map((periodDto) =>
            this.budgetPeriodRepository.create({
              budgetId: id,
              period: periodDto.period,
              amount: periodDto.amount,
            }),
          );
          await this.budgetPeriodRepository.save(periods);
        }
      }

      const updatedBudget = await this.budgetRepository.save(budget);

      // Reload budget with periods
      const reloadedBudget = await this.budgetRepository.findOne({
        where: { id: updatedBudget.id },
        relations: ['periods'],
      });

      if (!reloadedBudget) {
        throw new BadRequestException('Failed to reload updated budget');
      }

      return reloadedBudget;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update budget: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const budget = await this.findOne(id);
      await this.budgetRepository.remove(budget);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete budget: ${error.message}`);
    }
  }
}

