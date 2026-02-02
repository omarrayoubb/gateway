import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AttendancePolicyService } from './attendance-policy.service';
import { CreateAttendancePolicyDto } from './dto/create-attendance-policy.dto';
import { UpdateAttendancePolicyDto } from './dto/update-attendance-policy.dto';

@Controller()
export class AttendancePolicyGrpcController {
  constructor(private readonly policyService: AttendancePolicyService) {}

  @GrpcMethod('AttendancePolicyService', 'GetAttendancePolicy')
  async getAttendancePolicy(data: { id: string }) {
    try {
      const policy = await this.policyService.findOne(data.id);
      return this.mapPolicyToProto(policy);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get attendance policy',
      });
    }
  }

  @GrpcMethod('AttendancePolicyService', 'GetAttendancePolicies')
  async getAttendancePolicies() {
    try {
      const policies = await this.policyService.findAll();
      return {
        policies: policies.map(policy => this.mapPolicyToProto(policy)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get attendance policies',
      });
    }
  }

  @GrpcMethod('AttendancePolicyService', 'CreateAttendancePolicy')
  async createAttendancePolicy(data: any) {
    try {
      const createDto: CreateAttendancePolicyDto = {
        name: data.name,
        expectedStartTime: data.expectedStartTime,
        expectedEndTime: data.expectedEndTime,
        gracePeriodMinutes: data.gracePeriodMinutes ? parseInt(data.gracePeriodMinutes) : undefined,
        minimumHoursForFullDay: parseFloat(data.minimumHoursForFullDay),
        standardWorkHours: parseFloat(data.standardWorkHours),
        standardWorkDays: parseInt(data.standardWorkDays),
        lateArrivalDeductionPerHour: data.lateArrivalDeductionPerHour ? parseFloat(data.lateArrivalDeductionPerHour) : undefined,
        earlyDepartureDeductionPerHour: data.earlyDepartureDeductionPerHour ? parseFloat(data.earlyDepartureDeductionPerHour) : undefined,
        absentDayDeduction: data.absentDayDeduction ? parseFloat(data.absentDayDeduction) : undefined,
        halfDayDeduction: data.halfDayDeduction ? parseFloat(data.halfDayDeduction) : undefined,
        overtimeMultiplier: data.overtimeMultiplier ? parseFloat(data.overtimeMultiplier) : undefined,
      };

      const policy = await this.policyService.create(createDto);
      return this.mapPolicyToProto(policy);
    } catch (error) {
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create attendance policy',
      });
    }
  }

  @GrpcMethod('AttendancePolicyService', 'UpdateAttendancePolicy')
  async updateAttendancePolicy(data: any) {
    try {
      const updateDto: UpdateAttendancePolicyDto = {
        name: data.name,
        expectedStartTime: data.expectedStartTime,
        expectedEndTime: data.expectedEndTime,
        gracePeriodMinutes: data.gracePeriodMinutes ? parseInt(data.gracePeriodMinutes) : undefined,
        minimumHoursForFullDay: data.minimumHoursForFullDay ? parseFloat(data.minimumHoursForFullDay) : undefined,
        standardWorkHours: data.standardWorkHours ? parseFloat(data.standardWorkHours) : undefined,
        standardWorkDays: data.standardWorkDays ? parseInt(data.standardWorkDays) : undefined,
        lateArrivalDeductionPerHour: data.lateArrivalDeductionPerHour ? parseFloat(data.lateArrivalDeductionPerHour) : undefined,
        earlyDepartureDeductionPerHour: data.earlyDepartureDeductionPerHour ? parseFloat(data.earlyDepartureDeductionPerHour) : undefined,
        absentDayDeduction: data.absentDayDeduction ? parseFloat(data.absentDayDeduction) : undefined,
        halfDayDeduction: data.halfDayDeduction ? parseFloat(data.halfDayDeduction) : undefined,
        overtimeMultiplier: data.overtimeMultiplier ? parseFloat(data.overtimeMultiplier) : undefined,
      };
      const policy = await this.policyService.update(data.id, updateDto);
      return this.mapPolicyToProto(policy);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update attendance policy',
      });
    }
  }

  @GrpcMethod('AttendancePolicyService', 'DeleteAttendancePolicy')
  async deleteAttendancePolicy(data: { id: string }) {
    try {
      await this.policyService.remove(data.id);
      return { success: true, message: 'Attendance policy deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete attendance policy',
      });
    }
  }

  private mapPolicyToProto(policy: any) {
    return {
      id: policy.id,
      name: policy.name,
      expectedStartTime: policy.expectedStartTime || '',
      expectedEndTime: policy.expectedEndTime || '',
      gracePeriodMinutes: policy.gracePeriodMinutes || 0,
      minimumHoursForFullDay: policy.minimumHoursForFullDay ? policy.minimumHoursForFullDay.toString() : '0',
      standardWorkHours: policy.standardWorkHours ? policy.standardWorkHours.toString() : '0',
      standardWorkDays: policy.standardWorkDays || 0,
      lateArrivalDeductionPerHour: policy.lateArrivalDeductionPerHour ? policy.lateArrivalDeductionPerHour.toString() : '0',
      earlyDepartureDeductionPerHour: policy.earlyDepartureDeductionPerHour ? policy.earlyDepartureDeductionPerHour.toString() : '0',
      absentDayDeduction: policy.absentDayDeduction ? policy.absentDayDeduction.toString() : '0',
      halfDayDeduction: policy.halfDayDeduction ? policy.halfDayDeduction.toString() : '0',
      overtimeMultiplier: policy.overtimeMultiplier ? policy.overtimeMultiplier.toString() : '1.0',
      createdAt: policy.createdAt?.toISOString() || '',
    };
  }
}

