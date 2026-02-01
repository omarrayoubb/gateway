import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PayrollExceptionsService } from './payroll-exceptions.service';
import { CreatePayrollExceptionDto } from './dto/create-payroll-exception.dto';

@Controller()
export class PayrollExceptionsGrpcController {
  constructor(private readonly payrollExceptionsService: PayrollExceptionsService) {}

  @GrpcMethod('PayrollExceptionService', 'GetPayrollExceptions')
  async getPayrollExceptions() {
    try {
      const exceptions = await this.payrollExceptionsService.findAll();
      return {
        payrollExceptions: exceptions.map(exception => this.mapPayrollExceptionToProto(exception)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get payroll exceptions',
      });
    }
  }

  @GrpcMethod('PayrollExceptionService', 'CreatePayrollException')
  async createPayrollException(data: any) {
    try {
      const createDto: CreatePayrollExceptionDto = {
        employeeId: data.employeeId,
        payPeriod: data.payPeriod,
        exceptionType: data.exceptionType,
        description: data.description || undefined,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        status: data.status || undefined,
      };

      const exception = await this.payrollExceptionsService.create(createDto);
      return this.mapPayrollExceptionToProto(exception);
    } catch (error) {
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create payroll exception',
      });
    }
  }

  private mapPayrollExceptionToProto(exception: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: exception.id,
      employeeId: exception.employeeId,
      payPeriod: exception.payPeriod,
      exceptionType: exception.exceptionType,
      description: exception.description || '',
      amount: exception.amount ? parseFloat(exception.amount.toString()) : 0,
      status: exception.status,
      createdAt: formatDateTime(exception.createdAt),
    };
  }
}
