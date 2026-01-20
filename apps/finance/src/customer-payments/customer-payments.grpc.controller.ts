import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CustomerPaymentsService } from './customer-payments.service';
import { CreateCustomerPaymentDto } from './dto/create-customer-payment.dto';
import { UpdateCustomerPaymentDto } from './dto/update-customer-payment.dto';
import { CustomerPaymentPaginationDto } from './dto/pagination.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';
import { PaymentStatus, PaymentMethod } from './entities/customer-payment.entity';

@Controller()
export class CustomerPaymentsGrpcController {
  constructor(private readonly customerPaymentsService: CustomerPaymentsService) {}

  @GrpcMethod('CustomerPaymentsService', 'GetCustomerPayments')
  async getCustomerPayments(data: { sort?: string; customer_id?: string; status?: string }) {
    try {
      const query: CustomerPaymentPaginationDto = {
        sort: data.sort,
        customer_id: data.customer_id,
        status: data.status as PaymentStatus,
      };

      const payments = await this.customerPaymentsService.findAll(query);
      return {
        payments: payments.map(payment => this.mapPaymentToProto(payment)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get customer payments',
      });
    }
  }

  @GrpcMethod('CustomerPaymentsService', 'GetCustomerPayment')
  async getCustomerPayment(data: { id: string }) {
    try {
      const payment = await this.customerPaymentsService.findOne(data.id);
      return this.mapPaymentToProto(payment);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get customer payment',
      });
    }
  }

  @GrpcMethod('CustomerPaymentsService', 'GetUnallocatedPayments')
  async getUnallocatedPayments() {
    try {
      const payments = await this.customerPaymentsService.getUnallocated();
      return {
        payments: payments.map(payment => this.mapPaymentToProto(payment)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get unallocated payments',
      });
    }
  }

  @GrpcMethod('CustomerPaymentsService', 'CreateCustomerPayment')
  async createCustomerPayment(data: any) {
    try {
      const createDto: CreateCustomerPaymentDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        payment_number: data.paymentNumber || data.payment_number || undefined,
        customer_id: data.customerId || data.customer_id,
        payment_date: data.paymentDate || data.payment_date,
        payment_method: (data.paymentMethod || data.payment_method) as PaymentMethod,
        payment_reference: data.paymentReference || data.payment_reference || undefined,
        amount: parseFloat(data.amount),
        currency: data.currency || 'USD',
        bank_account_id: data.bankAccountId || data.bank_account_id || undefined,
        allocations: data.allocations ? data.allocations.map((alloc: any) => ({
          invoice_id: alloc.invoiceId || alloc.invoice_id,
          amount: parseFloat(alloc.amount),
        })) : undefined,
        status: data.status ? (data.status as PaymentStatus) : undefined,
      };

      const payment = await this.customerPaymentsService.create(createDto);
      return this.mapPaymentToProto(payment);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create customer payment',
      });
    }
  }

  @GrpcMethod('CustomerPaymentsService', 'UpdateCustomerPayment')
  async updateCustomerPayment(data: any) {
    try {
      const updateDto: UpdateCustomerPaymentDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        payment_number: data.paymentNumber || data.payment_number || undefined,
        customer_id: data.customerId || data.customer_id || undefined,
        payment_date: data.paymentDate || data.payment_date || undefined,
        payment_method: data.paymentMethod ? (data.paymentMethod as PaymentMethod) : undefined,
        payment_reference: data.paymentReference || data.payment_reference || undefined,
        amount: data.amount !== undefined ? parseFloat(data.amount) : undefined,
        currency: data.currency || undefined,
        bank_account_id: data.bankAccountId || data.bank_account_id || undefined,
        status: data.status ? (data.status as PaymentStatus) : undefined,
      };

      const payment = await this.customerPaymentsService.update(data.id, updateDto);
      return this.mapPaymentToProto(payment);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update customer payment',
      });
    }
  }

  @GrpcMethod('CustomerPaymentsService', 'AllocatePayment')
  async allocatePayment(data: { id: string; allocations: any[] }) {
    try {
      const allocateDto: AllocatePaymentDto = {
        allocations: data.allocations.map((alloc: any) => ({
          invoice_id: alloc.invoiceId || alloc.invoice_id,
          amount: parseFloat(alloc.amount),
        })),
      };

      const payment = await this.customerPaymentsService.allocate(data.id, allocateDto);
      return this.mapPaymentToProto(payment);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to allocate payment',
      });
    }
  }

  @GrpcMethod('CustomerPaymentsService', 'DeleteCustomerPayment')
  async deleteCustomerPayment(data: { id: string }) {
    try {
      await this.customerPaymentsService.remove(data.id);
      return { success: true, message: 'Customer payment deleted' };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to delete customer payment',
      });
    }
  }

  private mapPaymentToProto(payment: any): any {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      if (typeof date === 'string') {
        try {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          // If parsing fails, return date part if it's already in ISO format
        }
        return date.split('T')[0];
      }
      return '';
    };

    return {
      id: payment.id,
      organizationId: payment.organizationId || '',
      paymentNumber: payment.paymentNumber || '',
      customerId: payment.customerId || '',
      customerName: payment.customerName || '',
      paymentDate: formatDate(payment.paymentDate),
      paymentMethod: payment.paymentMethod,
      paymentReference: payment.paymentReference || '',
      amount: payment.amount ? payment.amount.toString() : '0',
      currency: payment.currency || 'USD',
      status: payment.status,
      allocatedAmount: payment.allocatedAmount ? payment.allocatedAmount.toString() : '0',
      unallocatedAmount: payment.unallocatedAmount ? payment.unallocatedAmount.toString() : '0',
      bankAccountId: payment.bankAccountId || '',
    };
  }
}

