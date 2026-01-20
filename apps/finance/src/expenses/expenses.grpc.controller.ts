import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller()
export class ExpensesGrpcController {
  constructor(private readonly expensesService: ExpensesService) {}

  @GrpcMethod('ExpensesService', 'GetExpense')
  async getExpense(data: { id: string }) {
    try {
      const expense = await this.expensesService.findOne(data.id);
      return this.mapExpenseToProto(expense);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get expense',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'GetExpenses')
  async getExpenses(data: {
    limit?: number;
    page?: number;
    sort?: string;
    status?: string;
    employee_id?: string;
    category_id?: string;
  }) {
    try {
      const result = await this.expensesService.findAll({
        limit: data.limit,
        page: data.page,
        sort: data.sort,
        status: data.status as any,
        employee_id: data.employee_id,
        category_id: data.category_id,
      });

      return {
        expenses: result.expenses.map(expense => this.mapExpenseToProto(expense)),
        total: result.total,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get expenses',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'CreateExpense')
  async createExpense(data: any) {
    try {
      const createDto: CreateExpenseDto = {
        organization_id: data.organizationId || data.organization_id,
        expense_number: data.expenseNumber || data.expense_number,
        employee_id: data.employeeId || data.employee_id,
        expense_date: data.expenseDate || data.expense_date,
        category_id: data.categoryId || data.category_id,
        description: data.description,
        amount: data.amount ? parseFloat(data.amount.toString()) : 0,
        currency: data.currency || 'USD',
        receipt_url: data.receiptUrl || data.receipt_url,
        account_id: data.accountId || data.account_id,
      };

      const expense = await this.expensesService.create(createDto);
      return this.mapExpenseToProto(expense);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create expense',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'UpdateExpense')
  async updateExpense(data: any) {
    try {
      const updateDto: UpdateExpenseDto = {
        organization_id: data.organizationId || data.organization_id,
        expense_number: data.expenseNumber || data.expense_number,
        employee_id: data.employeeId || data.employee_id,
        expense_date: data.expenseDate || data.expense_date,
        category_id: data.categoryId || data.category_id,
        description: data.description,
        amount: data.amount ? parseFloat(data.amount.toString()) : undefined,
        currency: data.currency,
        receipt_url: data.receiptUrl || data.receipt_url,
        status: data.status as any,
        account_id: data.accountId || data.account_id,
      };

      const expense = await this.expensesService.update(data.id, updateDto);
      return this.mapExpenseToProto(expense);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update expense',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'ApproveExpense')
  async approveExpense(data: { id: string }) {
    try {
      const expense = await this.expensesService.approve(data.id);
      return this.mapExpenseToProto(expense);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to approve expense',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'RejectExpense')
  async rejectExpense(data: { id: string; reason?: string }) {
    try {
      const expense = await this.expensesService.reject(data.id, data.reason);
      return this.mapExpenseToProto(expense);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to reject expense',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'DeleteExpense')
  async deleteExpense(data: { id: string }) {
    try {
      await this.expensesService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete expense',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'PostExpenseToGl')
  async postExpenseToGl(data: any) {
    try {
      const postDto = {
        posting_date: data.postingDate || data.posting_date,
        journal_entry_reference: data.journalEntryReference || data.journal_entry_reference,
      };
      const result = await this.expensesService.postToGl(data.id, postDto);
      return {
        success: true,
        message: 'Posted',
        journalEntryId: result.journalEntryId,
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to post expense to General Ledger',
      });
    }
  }

  @GrpcMethod('ExpensesService', 'BulkPostExpensesToGl')
  async bulkPostExpensesToGl(data: any) {
    try {
      const bulkPostDto = {
        expense_ids: data.expenseIds || data.expense_ids || [],
        posting_date: data.postingDate || data.posting_date,
      };
      const result = await this.expensesService.bulkPostToGl(bulkPostDto);
      return {
        success: result.success,
        postedCount: result.postedCount,
        errors: result.errors,
        journalEntryId: result.journalEntryId || '',
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to bulk post expenses to General Ledger',
      });
    }
  }

  private mapExpenseToProto(expense: any): any {
    // Handle date - could be Date object or string
    let expenseDate: string;
    if (expense.expenseDate instanceof Date) {
      expenseDate = expense.expenseDate.toISOString().split('T')[0];
    } else if (typeof expense.expenseDate === 'string') {
      expenseDate = expense.expenseDate.split('T')[0];
    } else {
      expenseDate = '';
    }

    return {
      id: expense.id,
      organizationId: expense.organizationId || '',
      expenseNumber: expense.expenseNumber || '',
      employeeId: expense.employeeId || '',
      employeeName: expense.employeeName || '',
      expenseDate: expenseDate,
      categoryId: expense.categoryId || '',
      categoryName: expense.categoryName || '',
      description: expense.description,
      amount: expense.amount ? expense.amount.toString() : '0',
      currency: expense.currency || 'USD',
      receiptUrl: expense.receiptUrl || '',
      status: expense.status,
      accountId: expense.accountId || '',
      isPostedToGl: expense.isPostedToGl !== undefined ? expense.isPostedToGl : false,
    };
  }
}

