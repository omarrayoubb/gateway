import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VendorPaymentsService } from './vendor-payments.service';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { VendorPaymentPaginationDto } from './dto/pagination.dto';
import { VendorPaymentStatus, VendorPaymentMethod } from './entities/vendor-payment.entity';

@Controller()
export class VendorPaymentsGrpcController {
  constructor(private readonly vendorPaymentsService: VendorPaymentsService) {}

  @GrpcMethod('VendorPaymentsService', 'GetVendorPayments')
  async getVendorPayments(data: { sort?: string; vendor_id?: string; status?: string }) {
    try {
      const query: VendorPaymentPaginationDto = {
        sort: data.sort,
        vendor_id: data.vendor_id,
        status: data.status as VendorPaymentStatus,
      };

      const payments = await this.vendorPaymentsService.findAll(query);
      return {
        vendorPayments: payments.map(payment => this.mapPaymentToProto(payment)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get vendor payments',
      });
    }
  }

  @GrpcMethod('VendorPaymentsService', 'GetVendorPayment')
  async getVendorPayment(data: { id: string }) {
    try {
      const payment = await this.vendorPaymentsService.findOne(data.id);
      return this.mapPaymentToProto(payment);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get vendor payment',
      });
    }
  }

  @GrpcMethod('VendorPaymentsService', 'CreateVendorPayment')
  async createVendorPayment(data: any) {
    try {
      console.log('VendorPaymentsGrpcController - CreateVendorPayment received:', JSON.stringify({
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        vendorId: data?.vendorId,
        vendor_id: data?.vendor_id,
      }, null, 2));

      const vendorId = data.vendorId || data.vendor_id;
      if (!vendorId) {
        throw new BadRequestException('vendor_id is required');
      }

      const createDto: CreateVendorPaymentDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        payment_number: data.paymentNumber || data.payment_number || undefined,
        vendor_id: vendorId,
        payment_date: data.paymentDate || data.payment_date,
        payment_method: (data.paymentMethod || data.payment_method) as VendorPaymentMethod,
        amount: data.amount !== undefined ? parseFloat(data.amount.toString()) : undefined,
        currency: data.currency || 'USD',
        bank_account_id: data.bankAccountId || data.bank_account_id || undefined,
        allocations: data.allocations ? data.allocations.map((alloc: any) => ({
          bill_id: alloc.billId || alloc.bill_id,
          amount: parseFloat(alloc.amount.toString()),
        })) : undefined,
      };

      const payment = await this.vendorPaymentsService.create(createDto);
      return this.mapPaymentToProto(payment);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create vendor payment',
      });
    }
  }

  @GrpcMethod('VendorPaymentsService', 'ProcessVendorPayment')
  async processVendorPayment(data: { id: string }) {
    try {
      const payment = await this.vendorPaymentsService.process(data.id);
      return {
        success: true,
        payment: this.mapPaymentToProto(payment),
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to process vendor payment',
      });
    }
  }

  @GrpcMethod('VendorPaymentsService', 'DeleteVendorPayment')
  async deleteVendorPayment(data: { id: string }) {
    try {
      await this.vendorPaymentsService.remove(data.id);
      return { success: true, message: 'Vendor payment deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete vendor payment',
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

  private mapPaymentToProto(payment: any) {
    return {
      id: payment.id,
      organizationId: payment.organizationId || '',
      paymentNumber: payment.paymentNumber || '',
      vendorId: payment.vendorId || '',
      vendorName: payment.vendorName || '',
      paymentDate: this.formatDate(payment.paymentDate),
      paymentMethod: payment.paymentMethod,
      paymentReference: payment.paymentReference || '',
      amount: payment.amount ? payment.amount.toString() : '0',
      currency: payment.currency || 'USD',
      status: payment.status,
      bankAccountId: payment.bankAccountId || '',
      allocations: (payment.allocations || []).map((alloc: any) => ({
        id: alloc.id,
        billId: alloc.billId || '',
        amount: alloc.amount ? alloc.amount.toString() : '0',
      })),
      createdDate: this.formatDateTime(payment.createdDate),
      updatedAt: this.formatDateTime(payment.updatedAt),
    };
  }
}

