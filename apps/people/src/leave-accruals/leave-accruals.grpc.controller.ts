import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LeaveAccrualsService } from './leave-accruals.service';
import { CreateLeaveAccrualDto } from './dto/create-leave-accrual.dto';
import { UpdateLeaveAccrualDto } from './dto/update-leave-accrual.dto';

@Controller()
export class LeaveAccrualsGrpcController {
  constructor(private readonly leaveAccrualsService: LeaveAccrualsService) {}

  @GrpcMethod('LeaveAccrualService', 'GetLeaveAccrual')
  async getLeaveAccrual(data: { id: string }) {
    try {
      const leaveAccrual = await this.leaveAccrualsService.findOne(data.id);
      return this.mapLeaveAccrualToProto(leaveAccrual);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get leave accrual',
      });
    }
  }

  @GrpcMethod('LeaveAccrualService', 'GetLeaveAccruals')
  async getLeaveAccruals(data: {}) {
    try {
      const leaveAccruals = await this.leaveAccrualsService.findAll();
      return {
        leaveAccruals: leaveAccruals.map(la => this.mapLeaveAccrualToProto(la)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get leave accruals',
      });
    }
  }

  @GrpcMethod('LeaveAccrualService', 'CreateLeaveAccrual')
  async createLeaveAccrual(data: any) {
    try {
      const createDto: CreateLeaveAccrualDto = {
        employeeId: data.employeeId,
        leaveType: data.leaveType,
        accrualDate: data.accrualDate,
        daysAccrued: data.daysAccrued ? parseFloat(data.daysAccrued) : 0,
        description: data.description || undefined,
      };

      const leaveAccrual = await this.leaveAccrualsService.create(createDto);
      return this.mapLeaveAccrualToProto(leaveAccrual);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create leave accrual',
      });
    }
  }

  @GrpcMethod('LeaveAccrualService', 'UpdateLeaveAccrual')
  async updateLeaveAccrual(data: any) {
    try {
      const updateDto: UpdateLeaveAccrualDto = {
        employeeId: data.employeeId || undefined,
        leaveType: data.leaveType || undefined,
        accrualDate: data.accrualDate || undefined,
        daysAccrued: data.daysAccrued ? parseFloat(data.daysAccrued) : undefined,
        description: data.description || undefined,
      };
      const leaveAccrual = await this.leaveAccrualsService.update(data.id, updateDto);
      return this.mapLeaveAccrualToProto(leaveAccrual);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update leave accrual',
      });
    }
  }

  @GrpcMethod('LeaveAccrualService', 'DeleteLeaveAccrual')
  async deleteLeaveAccrual(data: { id: string }) {
    try {
      await this.leaveAccrualsService.remove(data.id);
      return { success: true, message: 'Leave accrual deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete leave accrual',
      });
    }
  }

  private mapLeaveAccrualToProto(leaveAccrual: any) {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: leaveAccrual.id,
      employeeId: leaveAccrual.employeeId,
      leaveType: leaveAccrual.leaveType,
      accrualDate: formatDate(leaveAccrual.accrualDate),
      daysAccrued: leaveAccrual.daysAccrued ? leaveAccrual.daysAccrued.toString() : '0',
      description: leaveAccrual.description || '',
      createdAt: formatDateTime(leaveAccrual.createdAt),
    };
  }
}

