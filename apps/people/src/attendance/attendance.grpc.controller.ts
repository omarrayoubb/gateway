import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStatus } from './entities/attendance.entity';

@Controller()
export class AttendanceGrpcController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @GrpcMethod('AttendanceService', 'GetAttendance')
  async getAttendance(data: { id: string }) {
    try {
      const attendance = await this.attendanceService.findOne(data.id);
      return this.mapAttendanceToProto(attendance);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get attendance',
      });
    }
  }

  @GrpcMethod('AttendanceService', 'GetAttendances')
  async getAttendances(data: {
    sort?: string;
    employeeId?: string;
    employeeEmail?: string;
    date?: string;
    status?: string;
  }) {
    try {
      const attendances = await this.attendanceService.findAll(data);
      return {
        attendances: attendances.map(att => this.mapAttendanceToProto(att)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get attendances',
      });
    }
  }

  @GrpcMethod('AttendanceService', 'CreateAttendance')
  async createAttendance(data: any) {
    try {
      const createDto: CreateAttendanceDto = {
        employeeId: data.employeeId,
        employeeEmail: data.employeeEmail || undefined,
        date: data.date,
        checkInTime: data.checkInTime || undefined,
        checkOutTime: data.checkOutTime || undefined,
        checkInLocation: data.checkInLocation || undefined,
        checkOutLocation: data.checkOutLocation || undefined,
        totalHours: data.totalHours ? parseFloat(data.totalHours) : undefined,
        overtimeHours: data.overtimeHours ? parseFloat(data.overtimeHours) : undefined,
        isLate: data.isLate || false,
        lateArrivalMinutes: data.lateArrivalMinutes ? parseInt(data.lateArrivalMinutes) : undefined,
        earlyDepartureMinutes: data.earlyDepartureMinutes ? parseInt(data.earlyDepartureMinutes) : undefined,
        deductionAmount: data.deductionAmount ? parseFloat(data.deductionAmount) : undefined,
        status: data.status || AttendanceStatus.PRESENT,
      };

      const attendance = await this.attendanceService.create(createDto);
      return this.mapAttendanceToProto(attendance);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create attendance',
      });
    }
  }

  @GrpcMethod('AttendanceService', 'UpdateAttendance')
  async updateAttendance(data: any) {
    try {
      const updateDto: UpdateAttendanceDto = {
        checkOutTime: data.checkOutTime || undefined,
        checkOutLocation: data.checkOutLocation || undefined,
        totalHours: data.totalHours ? parseFloat(data.totalHours) : undefined,
        overtimeHours: data.overtimeHours ? parseFloat(data.overtimeHours) : undefined,
      };
      const attendance = await this.attendanceService.update(data.id, updateDto);
      return this.mapAttendanceToProto(attendance);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update attendance',
      });
    }
  }

  @GrpcMethod('AttendanceService', 'DeleteAttendance')
  async deleteAttendance(data: { id: string }) {
    try {
      await this.attendanceService.remove(data.id);
      return { success: true, message: 'Attendance deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete attendance',
      });
    }
  }

  private mapAttendanceToProto(attendance: any) {
    // Helper function to format date (handles both Date objects and strings)
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    // Helper function to format datetime (handles both Date objects and strings)
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: attendance.id,
      employeeId: attendance.employeeId,
      employeeEmail: attendance.employeeEmail || '',
      date: formatDate(attendance.date),
      checkInTime: formatDateTime(attendance.checkInTime),
      checkOutTime: formatDateTime(attendance.checkOutTime),
      checkInLocation: attendance.checkInLocation || '',
      checkOutLocation: attendance.checkOutLocation || '',
      totalHours: attendance.totalHours ? attendance.totalHours.toString() : '0',
      overtimeHours: attendance.overtimeHours ? attendance.overtimeHours.toString() : '0',
      isLate: attendance.isLate || false,
      lateArrivalMinutes: attendance.lateArrivalMinutes || 0,
      earlyDepartureMinutes: attendance.earlyDepartureMinutes || 0,
      deductionAmount: attendance.deductionAmount ? attendance.deductionAmount.toString() : '0',
      status: attendance.status,
      createdAt: formatDateTime(attendance.createdAt),
    };
  }
}

