import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AccruedExpensesService } from './accrued-expenses.service';
import { CreateAccruedExpenseDto } from './dto/create-accrued-expense.dto';
import { UpdateAccruedExpenseDto } from './dto/update-accrued-expense.dto';
import { AccruedExpensePaginationDto } from './dto/pagination.dto';
import { ReverseAccruedExpenseDto } from './dto/reverse-accrued-expense.dto';

@Controller()
export class AccruedExpensesGrpcController {
  constructor(private readonly accruedExpensesService: AccruedExpensesService) {}

  @GrpcMethod('AccruedExpensesService', 'GetAccruedExpenses')
  async getAccruedExpenses(data: any) {
    try {
      const paginationDto: AccruedExpensePaginationDto = {
        sort: data.sort,
        status: data.status,
      };

      const accruedExpenses = await this.accruedExpensesService.findAll(paginationDto);
      return {
        accruedExpenses: accruedExpenses.map((accrued) => this.mapAccruedExpenseToProto(accrued)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get accrued expenses',
      });
    }
  }

  @GrpcMethod('AccruedExpensesService', 'GetAccruedExpense')
  async getAccruedExpense(data: { id: string }) {
    try {
      const accruedExpense = await this.accruedExpensesService.findOne(data.id);
      return this.mapAccruedExpenseToProto(accruedExpense);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get accrued expense',
      });
    }
  }

  @GrpcMethod('AccruedExpensesService', 'CreateAccruedExpense')
  async createAccruedExpense(data: any) {
    try {
      const createDto: CreateAccruedExpenseDto = {
        organization_id: data.organizationId,
        accrual_number: data.accrualNumber,
        expense_description: data.expenseDescription,
        accrual_date: data.accrualDate,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        currency: data.currency,
        account_id: data.accountId,
        vendor_id: data.vendorId,
      };

      const accruedExpense = await this.accruedExpensesService.create(createDto);
      return this.mapAccruedExpenseToProto(accruedExpense);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create accrued expense',
      });
    }
  }

  @GrpcMethod('AccruedExpensesService', 'UpdateAccruedExpense')
  async updateAccruedExpense(data: any) {
    try {
      const updateDto: UpdateAccruedExpenseDto = {
        ...(data.accrualNumber && { accrual_number: data.accrualNumber }),
        ...(data.expenseDescription && { expense_description: data.expenseDescription }),
        ...(data.accrualDate && { accrual_date: data.accrualDate }),
        ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.accountId && { account_id: data.accountId }),
        ...(data.vendorId !== undefined && { vendor_id: data.vendorId }),
        ...(data.status && { status: data.status }),
        ...(data.reversalDate && { reversal_date: data.reversalDate }),
        ...(data.reversalReason && { reversal_reason: data.reversalReason }),
      };

      const accruedExpense = await this.accruedExpensesService.update(data.id, updateDto);
      return this.mapAccruedExpenseToProto(accruedExpense);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update accrued expense',
      });
    }
  }

  @GrpcMethod('AccruedExpensesService', 'DeleteAccruedExpense')
  async deleteAccruedExpense(data: { id: string }) {
    try {
      await this.accruedExpensesService.remove(data.id);
      return { success: true, message: 'Accrued expense deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete accrued expense',
      });
    }
  }

  @GrpcMethod('AccruedExpensesService', 'ReverseAccruedExpense')
  async reverseAccruedExpense(data: any) {
    try {
      const reverseDto: ReverseAccruedExpenseDto = {
        reversal_date: data.reversalDate,
        reason: data.reason,
      };

      const accruedExpense = await this.accruedExpensesService.reverse(data.id, reverseDto);
      return this.mapAccruedExpenseToProto(accruedExpense);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to reverse accrued expense',
      });
    }
  }

  private mapAccruedExpenseToProto(accrued: any) {
    return {
      id: accrued.id,
      organizationId: accrued.organizationId || '',
      accrualNumber: accrued.accrualNumber || '',
      expenseDescription: accrued.expenseDescription,
      accrualDate: accrued.accrualDate instanceof Date
        ? accrued.accrualDate.toISOString().split('T')[0]
        : accrued.accrualDate,
      amount: accrued.amount.toString(),
      currency: accrued.currency,
      accountId: accrued.accountId || '',
      vendorId: accrued.vendorId || '',
      status: accrued.status,
      reversalDate: accrued.reversalDate instanceof Date
        ? accrued.reversalDate.toISOString().split('T')[0]
        : (accrued.reversalDate || ''),
    };
  }
}

