import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LeavePoliciesService } from './leave-policies.service';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';

@Controller()
export class LeavePoliciesGrpcController {
  constructor(private readonly leavePoliciesService: LeavePoliciesService) {}

  @GrpcMethod('LeavePolicyService', 'GetLeavePolicy')
  async getLeavePolicy(data: { id: string }) {
    try {
      const leavePolicy = await this.leavePoliciesService.findOne(data.id);
      return this.mapLeavePolicyToProto(leavePolicy);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get leave policy',
      });
    }
  }

  @GrpcMethod('LeavePolicyService', 'GetLeavePolicies')
  async getLeavePolicies(data: {}) {
    try {
      const leavePolicies = await this.leavePoliciesService.findAll();
      return {
        leavePolicies: leavePolicies.map(lp => this.mapLeavePolicyToProto(lp)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get leave policies',
      });
    }
  }

  @GrpcMethod('LeavePolicyService', 'CreateLeavePolicy')
  async createLeavePolicy(data: any) {
    try {
      const createDto: CreateLeavePolicyDto = {
        name: data.name,
        description: data.description || undefined,
        maxCarryForwardDays: data.maxCarryForwardDays ? parseInt(data.maxCarryForwardDays) : undefined,
        accrualRate: data.accrualRate ? parseFloat(data.accrualRate) : undefined,
      };

      const leavePolicy = await this.leavePoliciesService.create(createDto);
      return this.mapLeavePolicyToProto(leavePolicy);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create leave policy',
      });
    }
  }

  @GrpcMethod('LeavePolicyService', 'UpdateLeavePolicy')
  async updateLeavePolicy(data: any) {
    try {
      const updateDto: UpdateLeavePolicyDto = {
        name: data.name || undefined,
        description: data.description || undefined,
        maxCarryForwardDays: data.maxCarryForwardDays ? parseInt(data.maxCarryForwardDays) : undefined,
        accrualRate: data.accrualRate ? parseFloat(data.accrualRate) : undefined,
      };
      const leavePolicy = await this.leavePoliciesService.update(data.id, updateDto);
      return this.mapLeavePolicyToProto(leavePolicy);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update leave policy',
      });
    }
  }

  @GrpcMethod('LeavePolicyService', 'DeleteLeavePolicy')
  async deleteLeavePolicy(data: { id: string }) {
    try {
      await this.leavePoliciesService.remove(data.id);
      return { success: true, message: 'Leave policy deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete leave policy',
      });
    }
  }

  private mapLeavePolicyToProto(leavePolicy: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: leavePolicy.id,
      name: leavePolicy.name,
      description: leavePolicy.description || '',
      maxCarryForwardDays: leavePolicy.maxCarryForwardDays || 0,
      accrualRate: leavePolicy.accrualRate ? leavePolicy.accrualRate.toString() : '0',
      createdAt: formatDateTime(leavePolicy.createdAt),
    };
  }
}

