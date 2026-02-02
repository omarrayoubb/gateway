import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PayrollRecordsService } from './payroll-records.service';
import { CreatePayrollRecordDto } from './dto/create-payroll-record.dto';
import { UpdatePayrollRecordDto } from './dto/update-payroll-record.dto';

@Controller()
export class PayrollRecordsGrpcController {
  constructor(private readonly payrollRecordsService: PayrollRecordsService) {}

  @GrpcMethod('PayrollRecordService', 'GetPayrollRecord')
  async getPayrollRecord(data: { id: string }) {
    try {
      const payrollRecord = await this.payrollRecordsService.findOne(data.id);
      return this.mapPayrollRecordToProto(payrollRecord);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get payroll record',
      });
    }
  }

  @GrpcMethod('PayrollRecordService', 'GetPayrollRecords')
  async getPayrollRecords(data: { 
    sort?: string; 
    employeeId?: string; 
    payPeriod?: string;
    status?: string;
  }) {
    try {
      const query = {
        sort: data.sort,
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        pay_period: data.payPeriod,
        payPeriod: data.payPeriod,
        status: data.status,
      };
      const payrollRecords = await this.payrollRecordsService.findAll(query);
      return {
        payrollRecords: payrollRecords.map(pr => this.mapPayrollRecordToProto(pr)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get payroll records',
      });
    }
  }

  @GrpcMethod('PayrollRecordService', 'CreatePayrollRecord')
  async createPayrollRecord(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.payPeriod) {
        throw new RpcException({
          code: 3,
          message: 'payPeriod is required',
        });
      }

      const createDto: CreatePayrollRecordDto = {
        employeeId: data.employeeId,
        payPeriod: data.payPeriod,
        grossPay: data.grossPay ? parseFloat(data.grossPay) : 0,
        deductions: data.deductions ? parseFloat(data.deductions) : 0,
        netPay: data.netPay ? parseFloat(data.netPay) : 0,
        status: data.status || undefined,
        paymentDate: data.paymentDate || undefined,
      };

      const payrollRecord = await this.payrollRecordsService.create(createDto);
      return this.mapPayrollRecordToProto(payrollRecord);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create payroll record',
      });
    }
  }

  @GrpcMethod('PayrollRecordService', 'UpdatePayrollRecord')
  async updatePayrollRecord(data: any) {
    try {
      const updateDto: UpdatePayrollRecordDto = {
        employeeId: data.employeeId || undefined,
        payPeriod: data.payPeriod || undefined,
        grossPay: data.grossPay ? parseFloat(data.grossPay) : undefined,
        deductions: data.deductions ? parseFloat(data.deductions) : undefined,
        netPay: data.netPay ? parseFloat(data.netPay) : undefined,
        status: data.status || undefined,
        paymentDate: data.paymentDate || undefined,
      };
      const payrollRecord = await this.payrollRecordsService.update(data.id, updateDto);
      return this.mapPayrollRecordToProto(payrollRecord);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update payroll record',
      });
    }
  }

  @GrpcMethod('PayrollRecordService', 'DeletePayrollRecord')
  async deletePayrollRecord(data: { id: string }) {
    try {
      await this.payrollRecordsService.remove(data.id);
      return { success: true, message: 'Payroll record deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete payroll record',
      });
    }
  }

  private mapPayrollRecordToProto(payrollRecord: any) {
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
      id: payrollRecord.id,
      employeeId: payrollRecord.employeeId,
      payPeriod: payrollRecord.payPeriod,
      grossPay: payrollRecord.grossPay ? parseFloat(payrollRecord.grossPay.toString()) : 0,
      deductions: payrollRecord.deductions ? parseFloat(payrollRecord.deductions.toString()) : 0,
      netPay: payrollRecord.netPay ? parseFloat(payrollRecord.netPay.toString()) : 0,
      status: payrollRecord.status,
      paymentDate: formatDate(payrollRecord.paymentDate),
      createdAt: formatDateTime(payrollRecord.createdAt),
    };
  }
}
