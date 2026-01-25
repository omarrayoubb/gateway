import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AttendanceSummaryService } from './attendance-summary.service';
import { CreateAttendanceSummaryDto } from './dto/create-attendance-summary.dto';
import { SummaryStatus } from './entities/attendance-summary.entity';

@Controller()
export class AttendanceSummaryGrpcController {
  constructor(private readonly summaryService: AttendanceSummaryService) {}

  @GrpcMethod('AttendanceSummaryService', 'GetAttendanceSummary')
  async getAttendanceSummary(data: { id: string }) {
    try {
      const summary = await this.summaryService.findOne(data.id);
      return this.mapSummaryToProto(summary);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get attendance summary',
      });
    }
  }

  @GrpcMethod('AttendanceSummaryService', 'GetAttendanceSummaries')
  async getAttendanceSummaries(data: {
    employeeId?: string;
    month?: string;
  }) {
    try {
      const summaries = await this.summaryService.findAll(data);
      return {
        summaries: summaries.map(sum => this.mapSummaryToProto(sum)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get attendance summaries',
      });
    }
  }

  @GrpcMethod('AttendanceSummaryService', 'CreateAttendanceSummary')
  async createAttendanceSummary(data: any) {
    try {
      const createDto: CreateAttendanceSummaryDto = {
        employeeId: data.employeeId,
        month: data.month,
        daysPresent: data.daysPresent ? parseInt(data.daysPresent) : undefined,
        daysAbsent: data.daysAbsent ? parseInt(data.daysAbsent) : undefined,
        totalHours: data.totalHours ? parseFloat(data.totalHours) : undefined,
        lateArrivalsCount: data.lateArrivalsCount ? parseInt(data.lateArrivalsCount) : undefined,
        overtimeHours: data.overtimeHours ? parseFloat(data.overtimeHours) : undefined,
        totalDeductions: data.totalDeductions ? parseFloat(data.totalDeductions) : undefined,
        status: data.status || SummaryStatus.PENDING,
      };

      const summary = await this.summaryService.create(createDto);
      return this.mapSummaryToProto(summary);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create attendance summary',
      });
    }
  }

  private mapSummaryToProto(summary: any) {
    return {
      id: summary.id,
      employeeId: summary.employeeId,
      month: summary.month,
      daysPresent: summary.daysPresent || 0,
      daysAbsent: summary.daysAbsent || 0,
      totalHours: summary.totalHours ? summary.totalHours.toString() : '0',
      lateArrivalsCount: summary.lateArrivalsCount || 0,
      overtimeHours: summary.overtimeHours ? summary.overtimeHours.toString() : '0',
      totalDeductions: summary.totalDeductions ? summary.totalDeductions.toString() : '0',
      status: summary.status,
      createdAt: summary.createdAt?.toISOString() || '',
    };
  }
}

