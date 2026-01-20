import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PaymentSchedulesService } from './payment-schedules.service';
import { CreatePaymentScheduleDto } from './dto/create-payment-schedule.dto';
import { PaymentSchedulePaginationDto } from './dto/pagination.dto';
import { PaymentScheduleStatus, PaymentScheduleMethod, PaymentSchedulePriority } from './entities/payment-schedule.entity';

@Controller()
export class PaymentSchedulesGrpcController {
  constructor(private readonly paymentSchedulesService: PaymentSchedulesService) {}

  @GrpcMethod('PaymentSchedulesService', 'GetPaymentSchedules')
  async getPaymentSchedules(data: { 
    vendor_id?: string; 
    status?: string; 
    due_date_from?: string; 
    due_date_to?: string;
    sort?: string;
  }) {
    try {
      const query: PaymentSchedulePaginationDto = {
        vendor_id: data.vendor_id,
        status: data.status as PaymentScheduleStatus,
        due_date_from: data.due_date_from,
        due_date_to: data.due_date_to,
        sort: data.sort,
      };

      const schedules = await this.paymentSchedulesService.findAll(query);
      return {
        paymentSchedules: schedules.map(schedule => this.mapScheduleToProto(schedule)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get payment schedules',
      });
    }
  }

  @GrpcMethod('PaymentSchedulesService', 'GetPaymentSchedule')
  async getPaymentSchedule(data: { id: string }) {
    try {
      const schedule = await this.paymentSchedulesService.findOne(data.id);
      return this.mapScheduleToProto(schedule);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get payment schedule',
      });
    }
  }

  @GrpcMethod('PaymentSchedulesService', 'CreatePaymentSchedule')
  async createPaymentSchedule(data: any) {
    try {
      console.log('PaymentSchedulesGrpcController - CreatePaymentSchedule received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        vendorId: data?.vendorId,
        vendor_id: data?.vendor_id,
        billId: data?.billId,
        bill_id: data?.bill_id,
      }, null, 2));

      const vendorId = data.vendorId || data.vendor_id;
      if (!vendorId) {
        throw new BadRequestException('vendor_id is required');
      }

      const billId = data.billId || data.bill_id;
      if (!billId) {
        throw new BadRequestException('bill_id is required');
      }

      const createDto: CreatePaymentScheduleDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        vendor_id: vendorId,
        bill_id: billId,
        due_date: data.dueDate || data.due_date,
        amount_due: data.amountDue !== undefined ? parseFloat(data.amountDue.toString()) : undefined,
        payment_method: data.paymentMethod || data.payment_method 
          ? (data.paymentMethod || data.payment_method) as PaymentScheduleMethod 
          : undefined,
        scheduled_payment_date: data.scheduledPaymentDate || data.scheduled_payment_date || undefined,
        priority: data.priority 
          ? (data.priority as PaymentSchedulePriority) 
          : undefined,
      };

      const schedule = await this.paymentSchedulesService.create(createDto);
      return this.mapScheduleToProto(schedule);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create payment schedule',
      });
    }
  }

  @GrpcMethod('PaymentSchedulesService', 'DeletePaymentSchedule')
  async deletePaymentSchedule(data: { id: string }) {
    try {
      await this.paymentSchedulesService.remove(data.id);
      return { success: true, message: 'Payment schedule deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete payment schedule',
      });
    }
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString().split('T')[0];
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  private formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString();
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return '';
  }

  private mapScheduleToProto(schedule: any) {
    return {
      id: schedule.id,
      organizationId: schedule.organizationId || '',
      vendorId: schedule.vendorId || '',
      vendorName: schedule.vendorName || '',
      billId: schedule.billId || '',
      billNumber: schedule.billNumber || '',
      dueDate: this.formatDate(schedule.dueDate),
      amountDue: schedule.amountDue ? schedule.amountDue.toString() : '0',
      status: schedule.status,
      paymentMethod: schedule.paymentMethod || '',
      scheduledPaymentDate: this.formatDate(schedule.scheduledPaymentDate),
      priority: schedule.priority || '',
      createdDate: this.formatDateTime(schedule.createdDate),
      updatedAt: this.formatDateTime(schedule.updatedAt),
    };
  }
}

