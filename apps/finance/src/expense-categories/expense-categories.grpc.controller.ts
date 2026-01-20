import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Controller()
export class ExpenseCategoriesGrpcController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @GrpcMethod('ExpenseCategoriesService', 'GetExpenseCategory')
  async getExpenseCategory(data: { id: string }) {
    try {
      const category = await this.expenseCategoriesService.findOne(data.id);
      return this.mapCategoryToProto(category);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get expense category',
      });
    }
  }

  @GrpcMethod('ExpenseCategoriesService', 'GetExpenseCategories')
  async getExpenseCategories(data: {
    limit?: number;
    page?: number;
    sort?: string;
    isActive?: boolean;
  }) {
    try {
      const result = await this.expenseCategoriesService.findAll({
        limit: data.limit,
        page: data.page,
        sort: data.sort,
        is_active: data.isActive,
      });

      return {
        categories: result.categories.map(category => this.mapCategoryToProto(category)),
        total: result.total,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get expense categories',
      });
    }
  }

  @GrpcMethod('ExpenseCategoriesService', 'CreateExpenseCategory')
  async createExpenseCategory(data: any) {
    try {
      const createDto: CreateExpenseCategoryDto = {
        organization_id: data.organizationId || data.organization_id,
        category_code: data.categoryCode || data.category_code,
        category_name: data.categoryName || data.category_name,
        description: data.description,
        account_id: data.accountId || data.account_id,
        requires_receipt: data.requiresReceipt !== undefined ? data.requiresReceipt : (data.requires_receipt !== undefined ? data.requires_receipt : false),
        requires_approval: data.requiresApproval !== undefined ? data.requiresApproval : (data.requires_approval !== undefined ? data.requires_approval : false),
        approval_limit: data.approvalLimit !== undefined ? parseFloat(data.approvalLimit.toString()) : (data.approval_limit !== undefined ? parseFloat(data.approval_limit.toString()) : undefined),
        is_active: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
      };

      const category = await this.expenseCategoriesService.create(createDto);
      return this.mapCategoryToProto(category);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create expense category',
      });
    }
  }

  @GrpcMethod('ExpenseCategoriesService', 'UpdateExpenseCategory')
  async updateExpenseCategory(data: any) {
    try {
      const updateDto: UpdateExpenseCategoryDto = {
        organization_id: data.organizationId || data.organization_id,
        category_code: data.categoryCode || data.category_code,
        category_name: data.categoryName || data.category_name,
        description: data.description,
        account_id: data.accountId || data.account_id,
        requires_receipt: data.requiresReceipt !== undefined ? data.requiresReceipt : data.requires_receipt,
        requires_approval: data.requiresApproval !== undefined ? data.requiresApproval : data.requires_approval,
        approval_limit: data.approvalLimit !== undefined ? parseFloat(data.approvalLimit.toString()) : (data.approval_limit !== undefined ? parseFloat(data.approval_limit.toString()) : undefined),
        is_active: data.isActive !== undefined ? data.isActive : data.is_active,
      };

      const category = await this.expenseCategoriesService.update(data.id, updateDto);
      return this.mapCategoryToProto(category);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update expense category',
      });
    }
  }

  @GrpcMethod('ExpenseCategoriesService', 'DeleteExpenseCategory')
  async deleteExpenseCategory(data: { id: string }) {
    try {
      await this.expenseCategoriesService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete expense category',
      });
    }
  }

  private mapCategoryToProto(category: any): any {
    return {
      id: category.id,
      organizationId: category.organizationId || '',
      categoryCode: category.categoryCode,
      categoryName: category.categoryName,
      description: category.description || '',
      accountId: category.accountId || '',
      requiresReceipt: category.requiresReceipt !== undefined ? category.requiresReceipt : false,
      requiresApproval: category.requiresApproval !== undefined ? category.requiresApproval : false,
      approvalLimit: category.approvalLimit ? category.approvalLimit.toString() : '0',
      isActive: category.isActive !== undefined ? category.isActive : true,
    };
  }
}

