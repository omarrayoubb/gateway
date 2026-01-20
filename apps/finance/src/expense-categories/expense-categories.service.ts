import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategoryPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>,
    private readonly organizationsService: OrganizationsService,
    private readonly accountsService: AccountsService,
  ) {}

  async create(createExpenseCategoryDto: CreateExpenseCategoryDto): Promise<ExpenseCategory> {
    try {
      // Validate required fields
      if (!createExpenseCategoryDto.category_code) {
        throw new BadRequestException('category_code is required');
      }
      if (!createExpenseCategoryDto.category_name) {
        throw new BadRequestException('category_name is required');
      }
      if (!createExpenseCategoryDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId = createExpenseCategoryDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Check for duplicate category codes
      const existingCategory = await this.expenseCategoryRepository.findOne({
        where: {
          categoryCode: createExpenseCategoryDto.category_code,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingCategory) {
        throw new ConflictException(`Expense category with code ${createExpenseCategoryDto.category_code} already exists`);
      }

      // Validate account exists
      const account = await this.accountsService.findOne(createExpenseCategoryDto.account_id);
      if (!account) {
        throw new NotFoundException(`Account with ID ${createExpenseCategoryDto.account_id} not found`);
      }

      // Create expense category
      const expenseCategory = this.expenseCategoryRepository.create({
        organizationId: organizationId || null,
        categoryCode: createExpenseCategoryDto.category_code,
        categoryName: createExpenseCategoryDto.category_name,
        description: createExpenseCategoryDto.description || null,
        accountId: createExpenseCategoryDto.account_id,
        requiresReceipt: createExpenseCategoryDto.requires_receipt !== undefined ? createExpenseCategoryDto.requires_receipt : false,
        requiresApproval: createExpenseCategoryDto.requires_approval !== undefined ? createExpenseCategoryDto.requires_approval : false,
        approvalLimit: createExpenseCategoryDto.approval_limit || null,
        isActive: createExpenseCategoryDto.is_active !== undefined ? createExpenseCategoryDto.is_active : true,
      });

      return await this.expenseCategoryRepository.save(expenseCategory);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error in ExpenseCategoriesService.create:', error);
      throw new BadRequestException(`Failed to create expense category: ${error.message}`);
    }
  }

  async findAll(query: ExpenseCategoryPaginationDto): Promise<{ categories: ExpenseCategory[]; total: number }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const queryBuilder = this.expenseCategoryRepository.createQueryBuilder('category');

      // Apply filters
      if (query.is_active !== undefined) {
        queryBuilder.andWhere('category.isActive = :isActive', { isActive: query.is_active });
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
          'category_code': 'categoryCode',
          'category_name': 'categoryName',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`category.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('category.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('category.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('category.createdDate', 'DESC');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(skip).take(limit);

      const categories = await queryBuilder.getMany();

      return { categories, total };
    } catch (error) {
      console.error('Error in ExpenseCategoriesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Expense category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateExpenseCategoryDto: UpdateExpenseCategoryDto): Promise<ExpenseCategory> {
    const category = await this.findOne(id);

    // Update fields
    if (updateExpenseCategoryDto.organization_id !== undefined) category.organizationId = updateExpenseCategoryDto.organization_id;
    if (updateExpenseCategoryDto.category_code !== undefined) {
      // Check for duplicate category codes if code is being changed
      if (category.categoryCode !== updateExpenseCategoryDto.category_code) {
        const existingCategory = await this.expenseCategoryRepository.findOne({
          where: {
            categoryCode: updateExpenseCategoryDto.category_code,
            organizationId: category.organizationId === null ? IsNull() : category.organizationId,
          },
        });
        if (existingCategory && existingCategory.id !== id) {
          throw new ConflictException(`Expense category with code ${updateExpenseCategoryDto.category_code} already exists`);
        }
      }
      category.categoryCode = updateExpenseCategoryDto.category_code;
    }
    if (updateExpenseCategoryDto.category_name !== undefined) category.categoryName = updateExpenseCategoryDto.category_name;
    if (updateExpenseCategoryDto.description !== undefined) category.description = updateExpenseCategoryDto.description;
    if (updateExpenseCategoryDto.account_id !== undefined) {
      // Validate account exists
      const account = await this.accountsService.findOne(updateExpenseCategoryDto.account_id);
      if (!account) {
        throw new NotFoundException(`Account with ID ${updateExpenseCategoryDto.account_id} not found`);
      }
      category.accountId = updateExpenseCategoryDto.account_id;
    }
    if (updateExpenseCategoryDto.requires_receipt !== undefined) category.requiresReceipt = updateExpenseCategoryDto.requires_receipt;
    if (updateExpenseCategoryDto.requires_approval !== undefined) category.requiresApproval = updateExpenseCategoryDto.requires_approval;
    if (updateExpenseCategoryDto.approval_limit !== undefined) category.approvalLimit = updateExpenseCategoryDto.approval_limit;
    if (updateExpenseCategoryDto.is_active !== undefined) category.isActive = updateExpenseCategoryDto.is_active;

    return await this.expenseCategoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.expenseCategoryRepository.remove(category);
  }
}

