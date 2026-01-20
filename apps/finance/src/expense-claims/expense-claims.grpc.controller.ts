import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ExpenseClaimsService } from './expense-claims.service';
import { CreateExpenseClaimDto } from './dto/create-expense-claim.dto';
import { UpdateExpenseClaimDto } from './dto/update-expense-claim.dto';
import { ApproveExpenseClaimDto } from './dto/approve-expense-claim.dto';
import { RejectExpenseClaimDto } from './dto/reject-expense-claim.dto';

@Controller()
export class ExpenseClaimsGrpcController {
  constructor(private readonly expenseClaimsService: ExpenseClaimsService) {}

  @GrpcMethod('ExpenseClaimsService', 'GetExpenseClaim')
  async getExpenseClaim(data: { id: string }) {
    try {
      const claim = await this.expenseClaimsService.findOne(data.id);
      return this.mapClaimToProto(claim);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get expense claim',
      });
    }
  }

  @GrpcMethod('ExpenseClaimsService', 'GetExpenseClaims')
  async getExpenseClaims(data: {
    limit?: number;
    page?: number;
    sort?: string;
    status?: string;
    employeeId?: string;
  }) {
    try {
      const result = await this.expenseClaimsService.findAll({
        limit: data.limit,
        page: data.page,
        sort: data.sort,
        status: data.status as any,
        employee_id: data.employeeId,
      });

      return {
        claims: result.claims.map(claim => this.mapClaimToProto(claim)),
        total: result.total,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get expense claims',
      });
    }
  }

  @GrpcMethod('ExpenseClaimsService', 'CreateExpenseClaim')
  async createExpenseClaim(data: any) {
    try {
      const createDto: CreateExpenseClaimDto = {
        organization_id: data.organizationId || data.organization_id,
        claim_number: data.claimNumber || data.claim_number,
        employee_id: data.employeeId || data.employee_id,
        claim_date: data.claimDate || data.claim_date,
        expense_ids: data.expenseIds || data.expense_ids || [],
        notes: data.notes,
      };

      const claim = await this.expenseClaimsService.create(createDto);
      return this.mapClaimToProto(claim);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create expense claim',
      });
    }
  }

  @GrpcMethod('ExpenseClaimsService', 'UpdateExpenseClaim')
  async updateExpenseClaim(data: any) {
    try {
      const updateDto: UpdateExpenseClaimDto = {
        organization_id: data.organizationId || data.organization_id,
        claim_number: data.claimNumber || data.claim_number,
        employee_id: data.employeeId || data.employee_id,
        claim_date: data.claimDate || data.claim_date,
        expense_ids: data.expenseIds || data.expense_ids,
        notes: data.notes,
        status: data.status as any,
      };

      const claim = await this.expenseClaimsService.update(data.id, updateDto);
      return this.mapClaimToProto(claim);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update expense claim',
      });
    }
  }

  @GrpcMethod('ExpenseClaimsService', 'SubmitExpenseClaim')
  async submitExpenseClaim(data: { id: string }) {
    try {
      const claim = await this.expenseClaimsService.submit(data.id);
      return this.mapClaimToProto(claim);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to submit expense claim',
      });
    }
  }

  @GrpcMethod('ExpenseClaimsService', 'ApproveExpenseClaim')
  async approveExpenseClaim(data: any) {
    try {
      const approveDto: ApproveExpenseClaimDto = {
        approved_by: data.approvedBy || data.approved_by,
        notes: data.notes,
      };

      const claim = await this.expenseClaimsService.approve(data.id, approveDto);
      return this.mapClaimToProto(claim);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to approve expense claim',
      });
    }
  }

  @GrpcMethod('ExpenseClaimsService', 'RejectExpenseClaim')
  async rejectExpenseClaim(data: any) {
    try {
      const rejectDto: RejectExpenseClaimDto = {
        rejected_by: data.rejectedBy || data.rejected_by,
        rejection_reason: data.rejectionReason || data.rejection_reason,
        notes: data.notes,
      };

      const claim = await this.expenseClaimsService.reject(data.id, rejectDto);
      return this.mapClaimToProto(claim);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to reject expense claim',
      });
    }
  }

  @GrpcMethod('ExpenseClaimsService', 'DeleteExpenseClaim')
  async deleteExpenseClaim(data: { id: string }) {
    try {
      await this.expenseClaimsService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete expense claim',
      });
    }
  }

  private mapClaimToProto(claim: any): any {
    // Handle date - could be Date object or string
    let claimDate: string;
    if (claim.claimDate instanceof Date) {
      claimDate = claim.claimDate.toISOString().split('T')[0];
    } else if (typeof claim.claimDate === 'string') {
      claimDate = claim.claimDate.split('T')[0];
    } else {
      claimDate = '';
    }

    return {
      id: claim.id,
      organizationId: claim.organizationId || '',
      claimNumber: claim.claimNumber || '',
      employeeId: claim.employeeId || '',
      employeeName: claim.employeeName || '',
      claimDate: claimDate,
      totalAmount: claim.totalAmount ? claim.totalAmount.toString() : '0',
      currency: claim.currency || 'USD',
      status: claim.status,
      notes: claim.notes || '',
      approvedBy: claim.approvedBy || '',
      rejectedBy: claim.rejectedBy || '',
      rejectionReason: claim.rejectionReason || '',
      expenses: (claim.expenses || []).map((exp: any) => ({
        expenseId: exp.expenseId || '',
        description: exp.description || '',
        amount: exp.amount ? exp.amount.toString() : '0',
      })),
    };
  }
}

