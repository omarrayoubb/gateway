import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LeaveBalancesService } from './leave-balances.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';

@Controller()
export class LeaveBalancesGrpcController {
  constructor(private readonly leaveBalancesService: LeaveBalancesService) {}

  @GrpcMethod('LeaveBalanceService', 'GetLeaveBalance')
  async getLeaveBalance(data: { id: string }) {
    try {
      const leaveBalance = await this.leaveBalancesService.findOne(data.id);
      return this.mapLeaveBalanceToProto(leaveBalance);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get leave balance',
      });
    }
  }

  @GrpcMethod('LeaveBalanceService', 'GetLeaveBalances')
  async getLeaveBalances(data: { employeeId?: string; leaveType?: string; year?: string }) {
    try {
      const leaveBalances = await this.leaveBalancesService.findAll(data);
      return {
        leaveBalances: leaveBalances.map(lb => this.mapLeaveBalanceToProto(lb)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get leave balances',
      });
    }
  }

  @GrpcMethod('LeaveBalanceService', 'CreateLeaveBalance')
  async createLeaveBalance(data: any) {
    try {
      const createDto: CreateLeaveBalanceDto = {
        employeeId: data.employeeId,
        leaveType: data.leaveType,
        balance: data.balance ? parseFloat(data.balance) : undefined,
        used: data.used ? parseFloat(data.used) : undefined,
        accrued: data.accrued ? parseFloat(data.accrued) : undefined,
        carriedForward: data.carriedForward ? parseFloat(data.carriedForward) : undefined,
        year: data.year ? parseInt(data.year) : new Date().getFullYear(),
      };

      const leaveBalance = await this.leaveBalancesService.create(createDto);
      return this.mapLeaveBalanceToProto(leaveBalance);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create leave balance',
      });
    }
  }

  @GrpcMethod('LeaveBalanceService', 'UpdateLeaveBalance')
  async updateLeaveBalance(data: any) {
    try {
      const updateDto: UpdateLeaveBalanceDto = {
        employeeId: data.employeeId || undefined,
        leaveType: data.leaveType || undefined,
        balance: data.balance ? parseFloat(data.balance) : undefined,
        used: data.used ? parseFloat(data.used) : undefined,
        accrued: data.accrued ? parseFloat(data.accrued) : undefined,
        carriedForward: data.carriedForward ? parseFloat(data.carriedForward) : undefined,
        year: data.year ? parseInt(data.year) : undefined,
      };
      const leaveBalance = await this.leaveBalancesService.update(data.id, updateDto);
      return this.mapLeaveBalanceToProto(leaveBalance);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update leave balance',
      });
    }
  }

  @GrpcMethod('LeaveBalanceService', 'DeleteLeaveBalance')
  async deleteLeaveBalance(data: { id: string }) {
    try {
      await this.leaveBalancesService.remove(data.id);
      return { success: true, message: 'Leave balance deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete leave balance',
      });
    }
  }

  @GrpcMethod('LeaveBalanceService', 'AdjustLeaveBalance')
  async adjustLeaveBalance(data: {
    employeeId: string;
    leaveType: string;
    year?: number;
    balanceDelta?: string;
  }) {
    try {
      const year = data.year ?? new Date().getFullYear();
      const balanceDelta = data.balanceDelta ? parseFloat(data.balanceDelta) : 0;
      const leaveBalance = await this.leaveBalancesService.adjustBalance(
        data.employeeId,
        data.leaveType,
        year,
        balanceDelta,
      );
      return this.mapLeaveBalanceToProto(leaveBalance);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to adjust leave balance',
      });
    }
  }

  private mapLeaveBalanceToProto(leaveBalance: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: leaveBalance.id,
      employeeId: leaveBalance.employeeId,
      leaveType: leaveBalance.leaveType,
      balance: leaveBalance.balance ? leaveBalance.balance.toString() : '0',
      used: leaveBalance.used ? leaveBalance.used.toString() : '0',
      accrued: leaveBalance.accrued ? leaveBalance.accrued.toString() : '0',
      carriedForward: leaveBalance.carriedForward ? leaveBalance.carriedForward.toString() : '0',
      year: leaveBalance.year || 0,
      updatedAt: formatDateTime(leaveBalance.updatedAt),
    };
  }
}

