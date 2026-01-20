import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicePaginationDto } from './dto/pagination.dto';
import { SendInvoiceDto } from './dto/send-invoice.dto';
import { InvoiceStatus, SendMethod } from './entities/invoice.entity';

@Controller()
export class InvoicesGrpcController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @GrpcMethod('InvoicesService', 'GetInvoices')
  async getInvoices(data: { sort?: string; status?: string; customer_id?: string; is_proforma?: boolean }) {
    try {
      const query: InvoicePaginationDto = {
        sort: data.sort,
        status: data.status as InvoiceStatus,
        customer_id: data.customer_id,
        is_proforma: data.is_proforma,
      };

      const invoices = await this.invoicesService.findAll(query);
      return {
        invoices: invoices.map(invoice => this.mapInvoiceToProto(invoice)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get invoices',
      });
    }
  }

  @GrpcMethod('InvoicesService', 'GetInvoice')
  async getInvoice(data: { id: string }) {
    try {
      const invoice = await this.invoicesService.findOne(data.id);
      return this.mapInvoiceToProto(invoice);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get invoice',
      });
    }
  }

  @GrpcMethod('InvoicesService', 'CreateInvoice')
  async createInvoice(data: any) {
    try {
      const createDto: CreateInvoiceDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        invoice_number: data.invoiceNumber || data.invoice_number || undefined,
        proforma_number: data.proformaNumber || data.proforma_number || undefined,
        is_proforma: data.isProforma !== undefined ? data.isProforma : (data.is_proforma !== undefined ? data.is_proforma : false),
        customer_account_name: data.customerAccountName || data.customer_account_name,
        customer_name: data.customerName || data.customer_name || undefined,
        customer_account_id: data.customerAccountId || data.customer_account_id || undefined,
        invoice_date: data.invoiceDate || data.invoice_date,
        due_date: data.dueDate || data.due_date || undefined,
        status: data.status ? (data.status as InvoiceStatus) : undefined,
        currency: data.currency || 'USD',
        tax_rate: data.taxRate !== undefined ? parseFloat(data.taxRate) : undefined,
        items: data.items ? data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity ? parseFloat(item.quantity) : undefined,
          unit_price: item.unitPrice !== undefined ? parseFloat(item.unitPrice) : undefined,
          tax_rate: item.taxRate !== undefined ? parseFloat(item.taxRate) : undefined,
          discount_percent: item.discountPercent !== undefined ? parseFloat(item.discountPercent) : undefined,
        })) : undefined,
        notes: data.notes || undefined,
      };

      const invoice = await this.invoicesService.create(createDto);
      return this.mapInvoiceToProto(invoice);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create invoice',
      });
    }
  }

  @GrpcMethod('InvoicesService', 'UpdateInvoice')
  async updateInvoice(data: any) {
    try {
      const updateDto: UpdateInvoiceDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        invoice_number: data.invoiceNumber || data.invoice_number || undefined,
        proforma_number: data.proformaNumber || data.proforma_number || undefined,
        is_proforma: data.isProforma !== undefined ? data.isProforma : undefined,
        customer_account_name: data.customerAccountName || data.customer_account_name || undefined,
        customer_name: data.customerName || data.customer_name || undefined,
        customer_account_id: data.customerAccountId || data.customer_account_id || undefined,
        invoice_date: data.invoiceDate || data.invoice_date || undefined,
        due_date: data.dueDate || data.due_date || undefined,
        status: data.status ? (data.status as InvoiceStatus) : undefined,
        currency: data.currency || undefined,
        tax_rate: data.taxRate !== undefined ? parseFloat(data.taxRate) : undefined,
        items: data.items ? data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity ? parseFloat(item.quantity) : undefined,
          unit_price: item.unitPrice !== undefined ? parseFloat(item.unitPrice) : undefined,
          tax_rate: item.taxRate !== undefined ? parseFloat(item.taxRate) : undefined,
          discount_percent: item.discountPercent !== undefined ? parseFloat(item.discountPercent) : undefined,
        })) : undefined,
        notes: data.notes || undefined,
      };

      const invoice = await this.invoicesService.update(data.id, updateDto);
      return this.mapInvoiceToProto(invoice);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update invoice',
      });
    }
  }

  @GrpcMethod('InvoicesService', 'SendInvoice')
  async sendInvoice(data: { id: string; send_method?: string; email_to?: string[]; email_subject?: string; email_message?: string; sent_by?: string }) {
    try {
      const sendDto: SendInvoiceDto = {
        send_method: data.send_method as SendMethod,
        email_to: data.email_to,
        email_subject: data.email_subject,
        email_message: data.email_message,
      };

      const invoice = await this.invoicesService.send(data.id, sendDto, data.sent_by);
      return this.mapInvoiceToProto(invoice);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to send invoice',
      });
    }
  }

  @GrpcMethod('InvoicesService', 'ConvertProforma')
  async convertProforma(data: { id: string }) {
    try {
      const invoice = await this.invoicesService.convertProforma(data.id);
      return {
        success: true,
        message: 'Converted',
        invoice: this.mapInvoiceToProto(invoice),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to convert proforma',
      });
    }
  }

  @GrpcMethod('InvoicesService', 'DeleteInvoice')
  async deleteInvoice(data: { id: string }) {
    try {
      await this.invoicesService.remove(data.id);
      return { success: true, message: 'Invoice deleted' };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to delete invoice',
      });
    }
  }

  private mapInvoiceToProto(invoice: any): any {
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
      id: invoice.id,
      organizationId: invoice.organizationId || '',
      invoiceNumber: invoice.invoiceNumber || '',
      proformaNumber: invoice.proformaNumber || '',
      isProforma: invoice.isProforma !== undefined ? invoice.isProforma : false,
      customerAccountId: invoice.customerAccountId || '',
      customerAccountName: invoice.customerAccountName || '',
      customerName: invoice.customerName || '',
      invoiceDate: formatDate(invoice.invoiceDate),
      dueDate: formatDate(invoice.dueDate),
      status: invoice.status,
      currency: invoice.currency || 'USD',
      subtotal: invoice.subtotal ? invoice.subtotal.toString() : '0',
      taxAmount: invoice.taxAmount ? invoice.taxAmount.toString() : '0',
      totalAmount: invoice.totalAmount ? invoice.totalAmount.toString() : '0',
      paidAmount: invoice.paidAmount ? invoice.paidAmount.toString() : '0',
      balanceDue: invoice.balanceDue ? invoice.balanceDue.toString() : '0',
      items: invoice.items ? invoice.items.map((item: any) => ({
        description: item.description || '',
        quantity: parseFloat(item.quantity?.toString() || '0'),
        unit_price: parseFloat(item.unitPrice?.toString() || '0'),
        amount: parseFloat(item.amount?.toString() || '0'),
      })) : [],
    };
  }
}

