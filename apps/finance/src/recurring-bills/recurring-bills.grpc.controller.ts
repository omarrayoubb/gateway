import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { RecurringBillsService } from './recurring-bills.service';
import { CreateRecurringBillDto } from './dto/create-recurring-bill.dto';
import { RecurringBillPaginationDto } from './dto/pagination.dto';
import { RecurringBillCategory, RecurringBillFrequency } from './entities/recurring-bill.entity';

@Controller()
export class RecurringBillsGrpcController {
  constructor(private readonly recurringBillsService: RecurringBillsService) {}

  @GrpcMethod('RecurringBillsService', 'GetRecurringBills')
  async getRecurringBills(data: { sort?: string; is_active?: boolean }) {
    try {
      const query: RecurringBillPaginationDto = {
        sort: data.sort,
        is_active: data.is_active !== undefined ? (typeof data.is_active === 'boolean' ? data.is_active : data.is_active === 'true') : undefined,
      };

      const recurringBills = await this.recurringBillsService.findAll(query);
      return {
        recurringBills: recurringBills.map(bill => this.mapRecurringBillToProto(bill)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get recurring bills',
      });
    }
  }

  @GrpcMethod('RecurringBillsService', 'GetRecurringBill')
  async getRecurringBill(data: { id: string }) {
    try {
      const recurringBill = await this.recurringBillsService.findOne(data.id);
      return this.mapRecurringBillToProto(recurringBill);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get recurring bill',
      });
    }
  }

  @GrpcMethod('RecurringBillsService', 'CreateRecurringBill')
  async createRecurringBill(data: any) {
    try {
      console.log('RecurringBillsGrpcController - CreateRecurringBill received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        vendorId: data?.vendorId,
        vendor_id: data?.vendor_id,
      }, null, 2));

      const vendorId = data.vendorId || data.vendor_id;
      if (!vendorId) {
        throw new BadRequestException('vendor_id is required');
      }

      const accountId = data.accountId || data.account_id;
      if (!accountId) {
        throw new BadRequestException('account_id is required');
      }

      const createDto: CreateRecurringBillDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        bill_name: data.billName || data.bill_name,
        vendor_id: vendorId,
        category: data.category ? (data.category as RecurringBillCategory) : undefined,
        amount: data.amount !== undefined ? parseFloat(data.amount.toString()) : undefined,
        currency: data.currency || 'USD',
        frequency: (data.frequency || data.frequency) as RecurringBillFrequency,
        start_date: data.startDate || data.start_date,
        end_date: data.endDate || data.end_date || undefined,
        is_active: data.isActive !== undefined 
          ? (typeof data.isActive === 'boolean' ? data.isActive : data.isActive === 'true')
          : undefined,
        auto_create: data.autoCreate !== undefined 
          ? (typeof data.autoCreate === 'boolean' ? data.autoCreate : data.autoCreate === 'true')
          : undefined,
        account_id: accountId,
      };

      const recurringBill = await this.recurringBillsService.create(createDto);
      return this.mapRecurringBillToProto(recurringBill);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create recurring bill',
      });
    }
  }

  @GrpcMethod('RecurringBillsService', 'DeleteRecurringBill')
  async deleteRecurringBill(data: { id: string }) {
    try {
      await this.recurringBillsService.remove(data.id);
      return { success: true, message: 'Recurring bill deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete recurring bill',
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

  private mapRecurringBillToProto(bill: any) {
    return {
      id: bill.id,
      organizationId: bill.organizationId || '',
      billName: bill.billName || '',
      vendorId: bill.vendorId || '',
      vendorName: bill.vendorName || '',
      category: bill.category || '',
      amount: bill.amount ? bill.amount.toString() : '0',
      currency: bill.currency || 'USD',
      frequency: bill.frequency,
      startDate: this.formatDate(bill.startDate),
      endDate: this.formatDate(bill.endDate),
      nextDueDate: this.formatDate(bill.nextDueDate),
      isActive: bill.isActive !== undefined ? bill.isActive : true,
      autoCreate: bill.autoCreate !== undefined ? bill.autoCreate : false,
      accountId: bill.accountId || '',
      createdDate: this.formatDateTime(bill.createdDate),
      updatedAt: this.formatDateTime(bill.updatedAt),
    };
  }
}

