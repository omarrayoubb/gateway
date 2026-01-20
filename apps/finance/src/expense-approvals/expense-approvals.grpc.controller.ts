import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ExpenseApprovalsService } from './expense-approvals.service';
import { CreateExpenseApprovalDto } from './dto/create-expense-approval.dto';
import { UpdateExpenseApprovalDto } from './dto/update-expense-approval.dto';

@Controller()
export class ExpenseApprovalsGrpcController {
  constructor(private readonly expenseApprovalsService: ExpenseApprovalsService) {}

  @GrpcMethod('ExpenseApprovalsService', 'GetExpenseApproval')
  async getExpenseApproval(data: { id: string }) {
    try {
      const approval = await this.expenseApprovalsService.findOne(data.id);
      return this.mapApprovalToProto(approval);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get expense approval',
      });
    }
  }

  @GrpcMethod('ExpenseApprovalsService', 'GetExpenseApprovals')
  async getExpenseApprovals(data: {
    limit?: number;
    page?: number;
    sort?: string;
    status?: string;
    approverId?: string;
  }) {
    try {
      const result = await this.expenseApprovalsService.findAll({
        limit: data.limit,
        page: data.page,
        sort: data.sort,
        status: data.status as any,
        approver_id: data.approverId,
      });

      return {
        approvals: result.approvals.map(approval => this.mapApprovalToProto(approval)),
        total: result.total,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get expense approvals',
      });
    }
  }

  @GrpcMethod('ExpenseApprovalsService', 'CreateExpenseApproval')
  async createExpenseApproval(data: any) {
    try {
      const createDto: CreateExpenseApprovalDto = {
        organization_id: data.organizationId || data.organization_id,
        expense_id: data.expenseId || data.expense_id,
        expense_claim_id: data.expenseClaimId || data.expense_claim_id,
        approver_id: data.approverId || data.approver_id,
        approval_level: data.approvalLevel !== undefined ? parseInt(data.approvalLevel.toString()) : (data.approval_level !== undefined ? parseInt(data.approval_level.toString()) : undefined),
      };

      const approval = await this.expenseApprovalsService.create(createDto);
      return this.mapApprovalToProto(approval);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create expense approval',
      });
    }
  }

  @GrpcMethod('ExpenseApprovalsService', 'UpdateExpenseApproval')
  async updateExpenseApproval(data: any) {
    try {
      const updateDto: UpdateExpenseApprovalDto = {
        organization_id: data.organizationId || data.organization_id,
        expense_id: data.expenseId || data.expense_id,
        expense_claim_id: data.expenseClaimId || data.expense_claim_id,
        approver_id: data.approverId || data.approver_id,
        approval_level: data.approvalLevel !== undefined ? parseInt(data.approvalLevel.toString()) : (data.approval_level !== undefined ? parseInt(data.approval_level.toString()) : undefined),
        status: data.status as any,
        approved_date: data.approvedDate || data.approved_date,
        notes: data.notes,
      };

      const approval = await this.expenseApprovalsService.update(data.id, updateDto);
      return this.mapApprovalToProto(approval);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update expense approval',
      });
    }
  }

  @GrpcMethod('ExpenseApprovalsService', 'ApproveExpenseApproval')
  async approveExpenseApproval(data: { id: string; notes?: string }) {
    try {
      const approval = await this.expenseApprovalsService.approve(data.id, data.notes);
      return this.mapApprovalToProto(approval);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to approve expense approval',
      });
    }
  }

  @GrpcMethod('ExpenseApprovalsService', 'RejectExpenseApproval')
  async rejectExpenseApproval(data: { id: string; notes?: string }) {
    try {
      const approval = await this.expenseApprovalsService.reject(data.id, data.notes);
      return this.mapApprovalToProto(approval);
    } catch (error) {
      throw new RpcException({
        code: error.status === 400 ? 3 : error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to reject expense approval',
      });
    }
  }

  @GrpcMethod('ExpenseApprovalsService', 'DeleteExpenseApproval')
  async deleteExpenseApproval(data: { id: string }) {
    try {
      await this.expenseApprovalsService.remove(data.id);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete expense approval',
      });
    }
  }

  private mapApprovalToProto(approval: any): any {
    // Handle date - could be Date object or string
    let approvedDate: string = '';
    if (approval.approvedDate) {
      if (approval.approvedDate instanceof Date) {
        approvedDate = approval.approvedDate.toISOString();
      } else if (typeof approval.approvedDate === 'string') {
        approvedDate = approval.approvedDate;
      }
    }

    return {
      id: approval.id,
      organizationId: approval.organizationId || '',
      expenseId: approval.expenseId || '',
      expenseClaimId: approval.expenseClaimId || '',
      approverId: approval.approverId || '',
      approverName: approval.approverName || '',
      approvalLevel: approval.approvalLevel || 1,
      status: approval.status,
      approvedDate: approvedDate,
      notes: approval.notes || '',
    };
  }
}

