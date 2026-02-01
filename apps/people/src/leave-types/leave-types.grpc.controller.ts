import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LeaveTypesService } from './leave-types.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Controller()
export class LeaveTypesGrpcController {
  constructor(private readonly leaveTypesService: LeaveTypesService) {}

  @GrpcMethod('LeaveTypeService', 'GetLeaveType')
  async getLeaveType(data: { id: string }) {
    try {
      const leaveType = await this.leaveTypesService.findOne(data.id);
      return this.mapLeaveTypeToProto(leaveType);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get leave type',
      });
    }
  }

  @GrpcMethod('LeaveTypeService', 'GetLeaveTypes')
  async getLeaveTypes(data: {}) {
    try {
      const leaveTypes = await this.leaveTypesService.findAll();
      return {
        leaveTypes: leaveTypes.map(lt => this.mapLeaveTypeToProto(lt)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get leave types',
      });
    }
  }

  @GrpcMethod('LeaveTypeService', 'CreateLeaveType')
  async createLeaveType(data: any) {
    try {
      const createDto: CreateLeaveTypeDto = {
        name: data.name,
        description: data.description || undefined,
        quota: data.quota ? parseInt(data.quota) : undefined,
        carryForward: data.carryForward || false,
        requiresApproval: data.requiresApproval !== undefined ? data.requiresApproval : true,
        trackInHours: data.trackInHours || false,
      };

      const leaveType = await this.leaveTypesService.create(createDto);
      return this.mapLeaveTypeToProto(leaveType);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create leave type',
      });
    }
  }

  @GrpcMethod('LeaveTypeService', 'UpdateLeaveType')
  async updateLeaveType(data: any) {
    try {
      const updateDto: UpdateLeaveTypeDto = {
        name: data.name || undefined,
        description: data.description || undefined,
        quota: data.quota ? parseInt(data.quota) : undefined,
        carryForward: data.carryForward !== undefined ? data.carryForward : undefined,
        requiresApproval: data.requiresApproval !== undefined ? data.requiresApproval : undefined,
        trackInHours: data.trackInHours !== undefined ? data.trackInHours : undefined,
      };
      const leaveType = await this.leaveTypesService.update(data.id, updateDto);
      return this.mapLeaveTypeToProto(leaveType);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update leave type',
      });
    }
  }

  @GrpcMethod('LeaveTypeService', 'DeleteLeaveType')
  async deleteLeaveType(data: { id: string }) {
    try {
      await this.leaveTypesService.remove(data.id);
      return { success: true, message: 'Leave type deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete leave type',
      });
    }
  }

  private mapLeaveTypeToProto(leaveType: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: leaveType.id,
      name: leaveType.name,
      description: leaveType.description || '',
      quota: leaveType.quota || 0,
      carryForward: leaveType.carryForward || false,
      requiresApproval: leaveType.requiresApproval !== undefined ? leaveType.requiresApproval : true,
      trackInHours: leaveType.trackInHours || false,
      createdAt: formatDateTime(leaveType.createdAt),
    };
  }
}

