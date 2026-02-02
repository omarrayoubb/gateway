import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';

@Controller()
export class ApprovalsGrpcController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @GrpcMethod('ApprovalService', 'CreateApproval')
  async createApproval(data: any) {
    try {
      const createDto: CreateApprovalDto = {
        requestType: data.requestType || data.request_type,
        requestId: data.requestId || data.request_id,
        requesterId: data.requesterId || data.requester_id,
        approvalChain: data.approvalChain || data.approval_chain,
      };

      const approval = await this.approvalsService.create(createDto);
      return this.mapApprovalToProto(approval);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create approval',
      });
    }
  }

  @GrpcMethod('ApprovalService', 'GetApprovals')
  async getApprovals(data: any) {
    try {
      const approvals = await this.approvalsService.findAll({
        status: data.status,
        requesterId: data.requesterId || data.requester_id,
        approverId: data.approverId || data.approver_id,
        requestType: data.requestType || data.request_type,
      });
      return {
        approvals: approvals.map(approval => this.mapApprovalToProto(approval)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get approvals',
      });
    }
  }

  @GrpcMethod('ApprovalService', 'GetApproval')
  async getApproval(data: { id: string }) {
    try {
      const approval = await this.approvalsService.findOne(data.id);
      return this.mapApprovalToProto(approval);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get approval',
      });
    }
  }

  @GrpcMethod('ApprovalService', 'Approve')
  async approve(data: any) {
    try {
      const approveDto: ApproveRequestDto = {
        comments: data.comments,
      };

      const approval = await this.approvalsService.approve(
        data.id,
        data.approverId || data.approver_id,
        approveDto,
      );
      return this.mapApprovalToProto(approval);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to approve',
      });
    }
  }

  @GrpcMethod('ApprovalService', 'Reject')
  async reject(data: any) {
    try {
      const rejectDto: RejectRequestDto = {
        rejectionReason: data.rejectionReason || data.rejection_reason,
      };

      const approval = await this.approvalsService.reject(
        data.id,
        data.approverId || data.approver_id,
        rejectDto,
      );
      return this.mapApprovalToProto(approval);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to reject',
      });
    }
  }

  @GrpcMethod('ApprovalService', 'GetHistory')
  async getHistory(data: { approvalId: string }) {
    try {
      const history = await this.approvalsService.getHistory(data.approvalId);
      return {
        history: history.map(h => ({
          id: h.id,
          approvalId: h.approvalId,
          approverId: h.approverId,
          action: h.action,
          comments: h.comments || '',
          createdAt: h.createdAt.toISOString(),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get approval history',
      });
    }
  }

  private mapApprovalToProto(approval: any) {
    return {
      id: approval.id,
      requestType: approval.requestType || approval.request_type,
      requestId: approval.requestId || approval.request_id,
      requesterId: approval.requesterId || approval.requester_id,
      currentApproverId: approval.currentApproverId || approval.current_approver_id || '',
      approvalChain: approval.approvalChain || approval.approval_chain || [],
      currentLevel: approval.currentLevel || approval.current_level || 0,
      totalLevels: approval.totalLevels || approval.total_levels || 0,
      status: approval.status,
      comments: approval.comments || '',
      rejectionReason: approval.rejectionReason || approval.rejection_reason || '',
      escalatedTo: approval.escalatedTo || approval.escalated_to || '',
      createdAt: approval.createdAt ? approval.createdAt.toISOString() : '',
      updatedAt: approval.updatedAt ? approval.updatedAt.toISOString() : '',
      approvedAt: approval.approvedAt ? approval.approvedAt.toISOString() : '',
      rejectedAt: approval.rejectedAt ? approval.rejectedAt.toISOString() : '',
    };
  }
}
