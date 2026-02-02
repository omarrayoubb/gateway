import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LeaveApprovalsService } from './leave-approvals.service';
import { CreateLeaveApprovalDto } from './dto/create-leave-approval.dto';
import { UpdateLeaveApprovalDto } from './dto/update-leave-approval.dto';

@Controller()
export class LeaveApprovalsGrpcController {
  constructor(private readonly leaveApprovalsService: LeaveApprovalsService) {}

  @GrpcMethod('LeaveApprovalService', 'GetLeaveApproval')
  async getLeaveApproval(data: { id: string }) {
    try {
      const leaveApproval = await this.leaveApprovalsService.findOne(data.id);
      return this.mapLeaveApprovalToProto(leaveApproval);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get leave approval',
      });
    }
  }

  @GrpcMethod('LeaveApprovalService', 'GetLeaveApprovals')
  async getLeaveApprovals(data: { sort?: string }) {
    try {
      const leaveApprovals = await this.leaveApprovalsService.findAll(data);
      return {
        leaveApprovals: leaveApprovals.map(la => this.mapLeaveApprovalToProto(la)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get leave approvals',
      });
    }
  }

  @GrpcMethod('LeaveApprovalService', 'CreateLeaveApproval')
  async createLeaveApproval(data: any) {
    try {
      const createDto: CreateLeaveApprovalDto = {
        leaveRequestId: data.leaveRequestId,
        approverId: data.approverId,
        status: data.status || undefined,
        approvalLevel: data.approvalLevel ? parseInt(data.approvalLevel) : 1,
        approvedDate: data.approvedDate || undefined,
        rejectedDate: data.rejectedDate || undefined,
        rejectionReason: data.rejectionReason || undefined,
      };

      const leaveApproval = await this.leaveApprovalsService.create(createDto);
      return this.mapLeaveApprovalToProto(leaveApproval);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create leave approval',
      });
    }
  }

  @GrpcMethod('LeaveApprovalService', 'UpdateLeaveApproval')
  async updateLeaveApproval(data: any) {
    try {
      const updateDto: UpdateLeaveApprovalDto = {
        leaveRequestId: data.leaveRequestId || undefined,
        approverId: data.approverId || undefined,
        status: data.status || undefined,
        approvalLevel: data.approvalLevel ? parseInt(data.approvalLevel) : undefined,
        approvedDate: data.approvedDate || undefined,
        rejectedDate: data.rejectedDate || undefined,
        rejectionReason: data.rejectionReason || undefined,
      };
      const leaveApproval = await this.leaveApprovalsService.update(data.id, updateDto);
      return this.mapLeaveApprovalToProto(leaveApproval);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update leave approval',
      });
    }
  }

  @GrpcMethod('LeaveApprovalService', 'DeleteLeaveApproval')
  async deleteLeaveApproval(data: { id: string }) {
    try {
      await this.leaveApprovalsService.remove(data.id);
      return { success: true, message: 'Leave approval deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete leave approval',
      });
    }
  }

  private mapLeaveApprovalToProto(leaveApproval: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: leaveApproval.id,
      leaveRequestId: leaveApproval.leaveRequestId,
      approverId: leaveApproval.approverId,
      status: leaveApproval.status,
      approvalLevel: leaveApproval.approvalLevel || 0,
      approvedDate: formatDateTime(leaveApproval.approvedDate),
      rejectedDate: formatDateTime(leaveApproval.rejectedDate),
      rejectionReason: leaveApproval.rejectionReason || '',
      createdAt: formatDateTime(leaveApproval.createdAt),
    };
  }
}

