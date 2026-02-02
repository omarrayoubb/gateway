import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';

@Controller()
export class LeaveRequestsGrpcController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @GrpcMethod('LeaveRequestService', 'GetLeaveRequest')
  async getLeaveRequest(data: { id: string }) {
    try {
      const leaveRequest = await this.leaveRequestsService.findOne(data.id);
      return this.mapLeaveRequestToProto(leaveRequest);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get leave request',
      });
    }
  }

  @GrpcMethod('LeaveRequestService', 'GetLeaveRequests')
  async getLeaveRequests(data: { sort?: string; employeeId?: string; status?: string }) {
    try {
      const query = {
        sort: data.sort,
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        status: data.status,
      };
      const leaveRequests = await this.leaveRequestsService.findAll(query);
      return {
        leaveRequests: leaveRequests.map(lr => this.mapLeaveRequestToProto(lr)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get leave requests',
      });
    }
  }

  @GrpcMethod('LeaveRequestService', 'CreateLeaveRequest')
  async createLeaveRequest(data: any) {
    try {
      // Validate required fields (employeeId is optional)
      if (!data.leaveType) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'leaveType is required',
        });
      }
      if (!data.startDate) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'startDate is required',
        });
      }
      if (!data.endDate) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'endDate is required',
        });
      }

      const createDto: CreateLeaveRequestDto = {
        employeeId: data.employeeId || undefined,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        numberOfDays: data.numberOfDays ? parseInt(data.numberOfDays) : 0,
        numberOfHours: data.numberOfHours ? parseFloat(data.numberOfHours) : undefined,
        hoursFrom: data.hoursFrom || data.hours_from || undefined,
        hoursTo: data.hoursTo || data.hours_to || undefined,
        reason: data.reason || undefined,
        status: data.status || undefined,
      };

      const leaveRequest = await this.leaveRequestsService.create(createDto);
      return this.mapLeaveRequestToProto(leaveRequest);
    } catch (error) {
      // If it's already an RpcException, re-throw it
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create leave request',
      });
    }
  }

  @GrpcMethod('LeaveRequestService', 'UpdateLeaveRequest')
  async updateLeaveRequest(data: any) {
    try {
      const updateDto: UpdateLeaveRequestDto = {
        employeeId: data.employeeId || undefined,
        leaveType: data.leaveType || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        numberOfDays: data.numberOfDays ? parseInt(data.numberOfDays) : undefined,
        numberOfHours: data.numberOfHours ? parseFloat(data.numberOfHours) : undefined,
        hoursFrom: data.hoursFrom || data.hours_from || undefined,
        hoursTo: data.hoursTo || data.hours_to || undefined,
        reason: data.reason || undefined,
        status: data.status || undefined,
      };
      const leaveRequest = await this.leaveRequestsService.update(data.id, updateDto);
      return this.mapLeaveRequestToProto(leaveRequest);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update leave request',
      });
    }
  }

  @GrpcMethod('LeaveRequestService', 'DeleteLeaveRequest')
  async deleteLeaveRequest(data: { id: string }) {
    try {
      await this.leaveRequestsService.remove(data.id);
      return { success: true, message: 'Leave request deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete leave request',
      });
    }
  }

  private mapLeaveRequestToProto(leaveRequest: any) {
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

    const formatDecimal = (v: any): string => {
      if (v == null || v === undefined) return '';
      if (typeof v === 'number') return String(v);
      return String(v);
    };

    return {
      id: leaveRequest.id,
      employeeId: leaveRequest.employeeId ?? '',
      leaveType: leaveRequest.leaveType,
      startDate: formatDate(leaveRequest.startDate),
      endDate: formatDate(leaveRequest.endDate),
      numberOfDays: leaveRequest.numberOfDays || 0,
      numberOfHours: leaveRequest.numberOfHours != null ? formatDecimal(leaveRequest.numberOfHours) : '',
      hoursFrom: leaveRequest.hoursFrom ?? '',
      hoursTo: leaveRequest.hoursTo ?? '',
      reason: leaveRequest.reason || '',
      status: leaveRequest.status,
      createdAt: formatDateTime(leaveRequest.createdAt),
    };
  }
}

