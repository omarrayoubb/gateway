import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseApproval, ApprovalStatus } from './entities/expense-approval.entity';
import { CreateExpenseApprovalDto } from './dto/create-expense-approval.dto';
import { UpdateExpenseApprovalDto } from './dto/update-expense-approval.dto';
import { ExpenseApprovalPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class ExpenseApprovalsService {
  constructor(
    @InjectRepository(ExpenseApproval)
    private readonly expenseApprovalRepository: Repository<ExpenseApproval>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createExpenseApprovalDto: CreateExpenseApprovalDto): Promise<ExpenseApproval> {
    try {
      // Validate required fields
      if (!createExpenseApprovalDto.approver_id) {
        throw new BadRequestException('approver_id is required');
      }

      // At least one of expense_id or expense_claim_id must be provided
      if (!createExpenseApprovalDto.expense_id && !createExpenseApprovalDto.expense_claim_id) {
        throw new BadRequestException('Either expense_id or expense_claim_id is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId = createExpenseApprovalDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Create expense approval
      const expenseApproval = this.expenseApprovalRepository.create({
        organizationId: organizationId || null,
        expenseId: createExpenseApprovalDto.expense_id || null,
        expenseClaimId: createExpenseApprovalDto.expense_claim_id || null,
        approverId: createExpenseApprovalDto.approver_id,
        approverName: null, // Will be populated from approver service if available
        approvalLevel: createExpenseApprovalDto.approval_level || 1,
        status: ApprovalStatus.PENDING,
        approvedDate: null,
        notes: null,
      });

      return await this.expenseApprovalRepository.save(expenseApproval);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in ExpenseApprovalsService.create:', error);
      throw new BadRequestException(`Failed to create expense approval: ${error.message}`);
    }
  }

  async findAll(query: ExpenseApprovalPaginationDto): Promise<{ approvals: ExpenseApproval[]; total: number }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const queryBuilder = this.expenseApprovalRepository.createQueryBuilder('approval');

      // Apply filters
      if (query.status) {
        queryBuilder.andWhere('approval.status = :status', { status: query.status });
      }

      if (query.approver_id) {
        queryBuilder.andWhere('approval.approverId = :approverId', { approverId: query.approver_id });
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
          'approved_date': 'approvedDate',
          'approval_level': 'approvalLevel',
          'status': 'status',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`approval.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('approval.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('approval.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('approval.createdDate', 'DESC');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      const approvals = await queryBuilder.getMany();

      return { approvals, total };
    } catch (error) {
      console.error('Error in ExpenseApprovalsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<ExpenseApproval> {
    const approval = await this.expenseApprovalRepository.findOne({
      where: { id },
    });
    if (!approval) {
      throw new NotFoundException(`Expense approval with ID ${id} not found`);
    }
    return approval;
  }

  async update(id: string, updateExpenseApprovalDto: UpdateExpenseApprovalDto): Promise<ExpenseApproval> {
    const approval = await this.findOne(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Cannot update an approval that is not pending');
    }

    // Update fields
    if (updateExpenseApprovalDto.organization_id !== undefined) approval.organizationId = updateExpenseApprovalDto.organization_id;
    if (updateExpenseApprovalDto.expense_id !== undefined) approval.expenseId = updateExpenseApprovalDto.expense_id;
    if (updateExpenseApprovalDto.expense_claim_id !== undefined) approval.expenseClaimId = updateExpenseApprovalDto.expense_claim_id;
    if (updateExpenseApprovalDto.approver_id !== undefined) approval.approverId = updateExpenseApprovalDto.approver_id;
    if (updateExpenseApprovalDto.approval_level !== undefined) approval.approvalLevel = updateExpenseApprovalDto.approval_level;
    if (updateExpenseApprovalDto.status !== undefined) {
      approval.status = updateExpenseApprovalDto.status;
      if (updateExpenseApprovalDto.status === ApprovalStatus.APPROVED || updateExpenseApprovalDto.status === ApprovalStatus.REJECTED) {
        approval.approvedDate = new Date();
      }
    }
    if (updateExpenseApprovalDto.approved_date !== undefined) {
      approval.approvedDate = updateExpenseApprovalDto.approved_date ? new Date(updateExpenseApprovalDto.approved_date) : null;
    }
    if (updateExpenseApprovalDto.notes !== undefined) approval.notes = updateExpenseApprovalDto.notes;

    return await this.expenseApprovalRepository.save(approval);
  }

  async approve(id: string, notes?: string): Promise<ExpenseApproval> {
    const approval = await this.findOne(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(`Cannot approve. Current status: ${approval.status}`);
    }

    approval.status = ApprovalStatus.APPROVED;
    approval.approvedDate = new Date();
    if (notes) {
      approval.notes = notes;
    }

    return await this.expenseApprovalRepository.save(approval);
  }

  async reject(id: string, notes?: string): Promise<ExpenseApproval> {
    const approval = await this.findOne(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(`Cannot reject. Current status: ${approval.status}`);
    }

    approval.status = ApprovalStatus.REJECTED;
    approval.approvedDate = new Date();
    if (notes) {
      approval.notes = notes;
    }

    return await this.expenseApprovalRepository.save(approval);
  }

  async remove(id: string): Promise<void> {
    const approval = await this.findOne(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Cannot delete an approval that is not pending');
    }

    await this.expenseApprovalRepository.remove(approval);
  }
}

