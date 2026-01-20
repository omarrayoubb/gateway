import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetPaginationDto } from './dto/pagination.dto';

@Controller()
export class BudgetsGrpcController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @GrpcMethod('BudgetsService', 'GetBudgets')
  async getBudgets(data: {
    page?: number;
    limit?: number;
    sort?: string;
    fiscalYear?: number;
    department?: string;
    projectId?: string;
  }) {
    try {
      const query: BudgetPaginationDto = {
        page: data.page,
        limit: data.limit,
        sort: data.sort,
        fiscal_year: data.fiscalYear,
        department: data.department,
        project_id: data.projectId,
      };

      const result = await this.budgetsService.findAll(query);
      return {
        budgets: result.budgets.map((budget) => this.mapBudgetToProto(budget)),
        total: result.total,
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to get budgets',
      });
    }
  }

  @GrpcMethod('BudgetsService', 'GetBudget')
  async getBudget(data: { id: string }) {
    try {
      const budget = await this.budgetsService.findOne(data.id);
      return this.mapBudgetToProto(budget);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get budget',
      });
    }
  }

  @GrpcMethod('BudgetsService', 'CreateBudget')
  async createBudget(data: any) {
    try {
      const createDto: CreateBudgetDto = {
        organization_id: data.organizationId || data.organization_id,
        budget_name: data.budgetName || data.budget_name,
        fiscal_year: data.fiscalYear || data.fiscal_year,
        period_type: (data.periodType || data.period_type) as any,
        department: data.department,
        project_id: data.projectId || data.project_id,
        account_id: data.accountId || data.account_id || undefined,
        budget_amount: data.budgetAmount !== undefined ? parseFloat(data.budgetAmount.toString()) : data.budget_amount,
        currency: data.currency || 'USD',
        status: (data.status as any) || undefined,
        periods: data.periods
          ? data.periods.map((p: any) => ({
              period: p.period,
              amount: parseFloat(p.amount.toString()),
            }))
          : undefined,
      };

      const budget = await this.budgetsService.create(createDto);
      return this.mapBudgetToProto(budget);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to create budget',
      });
    }
  }

  @GrpcMethod('BudgetsService', 'UpdateBudget')
  async updateBudget(data: { id: string; [key: string]: any }) {
    try {
      const updateDto: UpdateBudgetDto = {};
      
      if (data.organizationId !== undefined || data.organization_id !== undefined) {
        updateDto.organization_id = data.organizationId || data.organization_id;
      }
      if (data.budgetName !== undefined || data.budget_name !== undefined) {
        updateDto.budget_name = data.budgetName || data.budget_name;
      }
      if (data.fiscalYear !== undefined || data.fiscal_year !== undefined) {
        updateDto.fiscal_year = data.fiscalYear || data.fiscal_year;
      }
      if (data.periodType !== undefined || data.period_type !== undefined) {
        updateDto.period_type = (data.periodType || data.period_type) as any;
      }
      if (data.department !== undefined) {
        updateDto.department = data.department;
      }
      if (data.projectId !== undefined || data.project_id !== undefined) {
        updateDto.project_id = data.projectId || data.project_id;
      }
      if (data.accountId !== undefined || data.account_id !== undefined) {
        updateDto.account_id = data.accountId || data.account_id;
      }
      if (data.budgetAmount !== undefined || data.budget_amount !== undefined) {
        updateDto.budget_amount = data.budgetAmount !== undefined 
          ? parseFloat(data.budgetAmount.toString()) 
          : parseFloat(data.budget_amount.toString());
      }
      if (data.currency !== undefined) {
        updateDto.currency = data.currency;
      }
      if (data.status !== undefined) {
        updateDto.status = data.status as any;
      }
      if (data.periods !== undefined) {
        updateDto.periods = data.periods.map((p: any) => ({
          period: p.period,
          amount: parseFloat(p.amount.toString()),
        }));
      }

      const budget = await this.budgetsService.update(data.id, updateDto);
      return this.mapBudgetToProto(budget);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to update budget',
      });
    }
  }

  @GrpcMethod('BudgetsService', 'DeleteBudget')
  async deleteBudget(data: { id: string }) {
    try {
      await this.budgetsService.remove(data.id);
      return { success: true, message: 'Budget deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete budget',
      });
    }
  }

  private mapBudgetToProto(budget: any) {
    return {
      id: budget.id,
      organizationId: budget.organizationId || null,
      budgetName: budget.budgetName,
      fiscalYear: budget.fiscalYear,
      periodType: budget.periodType,
      department: budget.department || null,
      projectId: budget.projectId || null,
      accountId: budget.accountId,
      accountCode: budget.accountCode || null,
      accountName: budget.accountName || null,
      budgetAmount: budget.budgetAmount.toString(),
      currency: budget.currency || 'USD',
      status: budget.status,
      periods: (budget.periods || []).map((period: any) => ({
        period: period.period,
        amount: period.amount.toString(),
      })),
    };
  }
}

