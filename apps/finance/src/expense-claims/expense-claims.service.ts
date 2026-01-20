import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ExpenseClaim, ExpenseClaimStatus } from './entities/expense-claim.entity';
import { ExpenseClaimExpense } from './entities/expense-claim-expense.entity';
import { CreateExpenseClaimDto } from './dto/create-expense-claim.dto';
import { UpdateExpenseClaimDto } from './dto/update-expense-claim.dto';
import { ExpenseClaimPaginationDto } from './dto/pagination.dto';
import { ApproveExpenseClaimDto } from './dto/approve-expense-claim.dto';
import { RejectExpenseClaimDto } from './dto/reject-expense-claim.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { ExpensesService } from '../expenses/expenses.service';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class ExpenseClaimsService {
  constructor(
    @InjectRepository(ExpenseClaim)
    private readonly expenseClaimRepository: Repository<ExpenseClaim>,
    @InjectRepository(ExpenseClaimExpense)
    private readonly expenseClaimExpenseRepository: Repository<ExpenseClaimExpense>,
    private readonly organizationsService: OrganizationsService,
    private readonly expensesService: ExpensesService,
  ) {}

  async create(createExpenseClaimDto: CreateExpenseClaimDto): Promise<ExpenseClaim> {
    try {
      // Validate required fields
      if (!createExpenseClaimDto.claim_date) {
        throw new BadRequestException('claim_date is required');
      }
      if (!createExpenseClaimDto.expense_ids || createExpenseClaimDto.expense_ids.length === 0) {
        throw new BadRequestException('expense_ids is required and must contain at least one expense');
      }

      // Auto-fetch organization_id if not provided
      let organizationId = createExpenseClaimDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Generate claim number if not provided
      let claimNumber = createExpenseClaimDto.claim_number;
      if (!claimNumber) {
        claimNumber = await this.generateClaimNumber(organizationId);
      }

      // Check for duplicate claim numbers
      if (claimNumber) {
        const existingClaim = await this.expenseClaimRepository.findOne({
          where: {
            claimNumber: claimNumber,
            organizationId: organizationId === null ? IsNull() : organizationId,
          },
        });
        if (existingClaim) {
          throw new ConflictException(`Expense claim with number ${claimNumber} already exists`);
        }
      }

      // Validate and fetch expenses
      const expenses: Expense[] = [];
      let totalAmount = 0;
      let currency = 'USD';

      for (const expenseId of createExpenseClaimDto.expense_ids) {
        const expense = await this.expensesService.findOne(expenseId);
        if (!expense) {
          throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        // Check if expense is already in another claim
        const existingClaimExpense = await this.expenseClaimExpenseRepository.findOne({
          where: { expenseId: expenseId },
        });
        if (existingClaimExpense) {
          throw new BadRequestException(`Expense ${expenseId} is already part of another claim`);
        }

        expenses.push(expense);
        totalAmount += parseFloat(expense.amount.toString());
        currency = expense.currency || currency;
      }

      // Create expense claim
      const expenseClaim = this.expenseClaimRepository.create({
        organizationId: organizationId || null,
        claimNumber: claimNumber,
        employeeId: createExpenseClaimDto.employee_id || null,
        employeeName: null, // Will be populated from employee service if available
        claimDate: new Date(createExpenseClaimDto.claim_date),
        totalAmount: totalAmount,
        currency: currency,
        status: ExpenseClaimStatus.DRAFT,
        notes: createExpenseClaimDto.notes || null,
      });

      const savedClaim = await this.expenseClaimRepository.save(expenseClaim);

      // Create expense claim expenses
      const claimExpenses = expenses.map((expense) => {
        return this.expenseClaimExpenseRepository.create({
          expenseClaimId: savedClaim.id,
          expenseId: expense.id,
          description: expense.description,
          amount: parseFloat(expense.amount.toString()),
        });
      });

      await this.expenseClaimExpenseRepository.save(claimExpenses);

      return await this.findOne(savedClaim.id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error in ExpenseClaimsService.create:', error);
      throw new BadRequestException(`Failed to create expense claim: ${error.message}`);
    }
  }

  async findAll(query: ExpenseClaimPaginationDto): Promise<{ claims: ExpenseClaim[]; total: number }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const queryBuilder = this.expenseClaimRepository.createQueryBuilder('claim')
        .leftJoinAndSelect('claim.expenses', 'expenses');

      // Apply filters
      if (query.status) {
        queryBuilder.andWhere('claim.status = :status', { status: query.status });
      }

      if (query.employee_id) {
        queryBuilder.andWhere('claim.employeeId = :employeeId', { employeeId: query.employee_id });
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
          'claim_date': 'claimDate',
          'claim_number': 'claimNumber',
          'total_amount': 'totalAmount',
          'status': 'status',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`claim.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('claim.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('claim.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('claim.createdDate', 'DESC');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      const claims = await queryBuilder.getMany();

      return { claims, total };
    } catch (error) {
      console.error('Error in ExpenseClaimsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<ExpenseClaim> {
    const claim = await this.expenseClaimRepository.findOne({
      where: { id },
      relations: ['expenses'],
    });
    if (!claim) {
      throw new NotFoundException(`Expense claim with ID ${id} not found`);
    }
    return claim;
  }

  async update(id: string, updateExpenseClaimDto: UpdateExpenseClaimDto): Promise<ExpenseClaim> {
    const claim = await this.findOne(id);

    if (claim.status === ExpenseClaimStatus.PAID) {
      throw new BadRequestException('Cannot update a paid expense claim');
    }

    if (claim.status === ExpenseClaimStatus.APPROVED) {
      throw new BadRequestException('Cannot update an approved expense claim');
    }

    // Update fields
    if (updateExpenseClaimDto.organization_id !== undefined) claim.organizationId = updateExpenseClaimDto.organization_id;
    if (updateExpenseClaimDto.claim_number !== undefined) claim.claimNumber = updateExpenseClaimDto.claim_number;
    if (updateExpenseClaimDto.employee_id !== undefined) claim.employeeId = updateExpenseClaimDto.employee_id;
    if (updateExpenseClaimDto.claim_date !== undefined) claim.claimDate = new Date(updateExpenseClaimDto.claim_date);
    if (updateExpenseClaimDto.notes !== undefined) claim.notes = updateExpenseClaimDto.notes;
    if (updateExpenseClaimDto.status !== undefined) claim.status = updateExpenseClaimDto.status;

    // Update expenses if provided
    if (updateExpenseClaimDto.expense_ids && updateExpenseClaimDto.expense_ids.length > 0) {
      // Remove existing expenses
      await this.expenseClaimExpenseRepository.delete({ expenseClaimId: id });

      // Validate and add new expenses
      const expenses: Expense[] = [];
      let totalAmount = 0;
      let currency = 'USD';

      for (const expenseId of updateExpenseClaimDto.expense_ids) {
        const expense = await this.expensesService.findOne(expenseId);
        if (!expense) {
          throw new NotFoundException(`Expense with ID ${expenseId} not found`);
        }

        // Check if expense is already in another claim (excluding current claim)
        const existingClaimExpense = await this.expenseClaimExpenseRepository.findOne({
          where: { expenseId: expenseId },
        });
        if (existingClaimExpense && existingClaimExpense.expenseClaimId !== id) {
          throw new BadRequestException(`Expense ${expenseId} is already part of another claim`);
        }

        expenses.push(expense);
        totalAmount += parseFloat(expense.amount.toString());
        currency = expense.currency || currency;
      }

      // Create new expense claim expenses
      const claimExpenses = expenses.map((expense) => {
        return this.expenseClaimExpenseRepository.create({
          expenseClaimId: id,
          expenseId: expense.id,
          description: expense.description,
          amount: parseFloat(expense.amount.toString()),
        });
      });

      await this.expenseClaimExpenseRepository.save(claimExpenses);

      claim.totalAmount = totalAmount;
      claim.currency = currency;
    }

    return await this.expenseClaimRepository.save(claim);
  }

  async submit(id: string): Promise<ExpenseClaim> {
    const claim = await this.findOne(id);

    if (claim.status !== ExpenseClaimStatus.DRAFT) {
      throw new BadRequestException(`Cannot submit expense claim. Current status: ${claim.status}`);
    }

    if (!claim.expenses || claim.expenses.length === 0) {
      throw new BadRequestException('Cannot submit expense claim without expenses');
    }

    claim.status = ExpenseClaimStatus.SUBMITTED;
    return await this.expenseClaimRepository.save(claim);
  }

  async approve(id: string, approveDto: ApproveExpenseClaimDto): Promise<ExpenseClaim> {
    const claim = await this.findOne(id);

    if (claim.status === ExpenseClaimStatus.APPROVED) {
      throw new BadRequestException('Expense claim is already approved');
    }

    if (claim.status === ExpenseClaimStatus.REJECTED) {
      throw new BadRequestException('Cannot approve a rejected expense claim');
    }

    if (claim.status === ExpenseClaimStatus.PAID) {
      throw new BadRequestException('Expense claim is already paid');
    }

    if (claim.status !== ExpenseClaimStatus.SUBMITTED && claim.status !== ExpenseClaimStatus.UNDER_REVIEW) {
      throw new BadRequestException(`Cannot approve expense claim. Current status: ${claim.status}`);
    }

    claim.status = ExpenseClaimStatus.APPROVED;
    if (approveDto.approved_by) {
      claim.approvedBy = approveDto.approved_by;
    }
    if (approveDto.notes) {
      claim.notes = claim.notes ? `${claim.notes}\nApproved: ${approveDto.notes}` : `Approved: ${approveDto.notes}`;
    }

    return await this.expenseClaimRepository.save(claim);
  }

  async reject(id: string, rejectDto: RejectExpenseClaimDto): Promise<ExpenseClaim> {
    const claim = await this.findOne(id);

    if (claim.status === ExpenseClaimStatus.REJECTED) {
      throw new BadRequestException('Expense claim is already rejected');
    }

    if (claim.status === ExpenseClaimStatus.PAID) {
      throw new BadRequestException('Cannot reject a paid expense claim');
    }

    if (claim.status === ExpenseClaimStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an approved expense claim');
    }

    claim.status = ExpenseClaimStatus.REJECTED;
    if (rejectDto.rejected_by) {
      claim.rejectedBy = rejectDto.rejected_by;
    }
    claim.rejectionReason = rejectDto.rejection_reason;
    if (rejectDto.notes) {
      claim.notes = claim.notes ? `${claim.notes}\nRejected: ${rejectDto.notes}` : `Rejected: ${rejectDto.notes}`;
    }

    return await this.expenseClaimRepository.save(claim);
  }

  async remove(id: string): Promise<void> {
    const claim = await this.findOne(id);

    if (claim.status === ExpenseClaimStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid expense claim');
    }

    await this.expenseClaimRepository.remove(claim);
  }

  private async generateClaimNumber(organizationId: string | null): Promise<string> {
    const prefix = 'ECL';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.expenseClaimRepository
      .createQueryBuilder('claim')
      .where('claim.claimNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('claim.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('claim.organizationId IS NULL');
    }

    queryBuilder.orderBy('claim.claimNumber', 'DESC').limit(1);

    const lastClaim = await queryBuilder.getOne();

    let sequence = 1;
    if (lastClaim && lastClaim.claimNumber) {
      const parts = lastClaim.claimNumber.split('-');
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

