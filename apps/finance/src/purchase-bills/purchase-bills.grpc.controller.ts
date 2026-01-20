import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PurchaseBillsService } from './purchase-bills.service';
import { CreatePurchaseBillDto } from './dto/create-purchase-bill.dto';
import { UpdatePurchaseBillDto } from './dto/update-purchase-bill.dto';
import { PurchaseBillPaginationDto } from './dto/pagination.dto';
import { PurchaseBillStatus } from './entities/purchase-bill.entity';

@Controller()
export class PurchaseBillsGrpcController {
  constructor(private readonly purchaseBillsService: PurchaseBillsService) {}

  @GrpcMethod('PurchaseBillsService', 'GetPurchaseBills')
  async getPurchaseBills(data: { sort?: string; status?: string; vendor_id?: string }) {
    try {
      const query: PurchaseBillPaginationDto = {
        sort: data.sort,
        status: data.status as PurchaseBillStatus,
        vendor_id: data.vendor_id,
      };

      const bills = await this.purchaseBillsService.findAll(query);
      return {
        purchaseBills: bills.map(bill => this.mapPurchaseBillToProto(bill)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get purchase bills',
      });
    }
  }

  @GrpcMethod('PurchaseBillsService', 'GetPurchaseBill')
  async getPurchaseBill(data: { id: string }) {
    try {
      const bill = await this.purchaseBillsService.findOne(data.id);
      return this.mapPurchaseBillToProto(bill);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get purchase bill',
      });
    }
  }

  @GrpcMethod('PurchaseBillsService', 'CreatePurchaseBill')
  async createPurchaseBill(data: any) {
    try {
      const createDto: CreatePurchaseBillDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        bill_number: data.billNumber || data.bill_number || undefined,
        vendor_id: data.vendorId || data.vendor_id,
        bill_date: data.billDate || data.bill_date,
        due_date: data.dueDate || data.due_date || undefined,
        status: data.status ? (data.status as PurchaseBillStatus) : undefined,
        currency: data.currency || 'USD',
        tax_rate: data.taxRate !== undefined ? parseFloat(data.taxRate) : (data.tax_rate !== undefined ? parseFloat(data.tax_rate) : undefined),
        attachment_url: data.attachmentUrl || data.attachment_url || undefined,
        attachment_name: data.attachmentName || data.attachment_name || undefined,
        items: data.items ? data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity ? parseFloat(item.quantity) : 1,
          unit_price: item.unitPrice !== undefined ? parseFloat(item.unitPrice) : (item.unit_price !== undefined ? parseFloat(item.unit_price) : undefined),
          account_id: item.accountId || item.account_id || undefined,
        })) : [],
      };

      const bill = await this.purchaseBillsService.create(createDto);
      return this.mapPurchaseBillToProto(bill);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create purchase bill',
      });
    }
  }

  @GrpcMethod('PurchaseBillsService', 'UpdatePurchaseBill')
  async updatePurchaseBill(data: any) {
    try {
      // Log items to see what we're receiving
      const itemsInfo = {
        hasItems: data.items !== undefined,
        isArray: Array.isArray(data.items),
        length: Array.isArray(data.items) ? data.items.length : 0,
        items: data.items,
      };
      
      console.log('UpdatePurchaseBill received data:', {
        id: data.id,
        attachmentUrl: data.attachmentUrl,
        attachment_url: data.attachment_url,
        attachmentName: data.attachmentName,
        attachment_name: data.attachment_name,
        itemsInfo,
      });
      
      // Determine if we should include items
      // Only include items if they're explicitly provided AND not empty
      let itemsToInclude: any[] | undefined = undefined;
      if (data.items !== undefined && Array.isArray(data.items)) {
        if (data.items.length > 0) {
          itemsToInclude = data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity ? parseFloat(item.quantity) : 1,
            unit_price: item.unitPrice !== undefined ? parseFloat(item.unitPrice) : (item.unit_price !== undefined ? parseFloat(item.unit_price) : undefined),
            account_id: item.accountId || item.account_id || undefined,
          }));
          console.log('Including items in update:', itemsToInclude?.length || 0);
        } else {
          console.log('Items array is empty, NOT including items in update (preserving existing items)');
        }
      } else {
        console.log('Items is undefined or not an array, NOT including items in update (preserving existing items)');
      }
      
      const updateDto: UpdatePurchaseBillDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        bill_number: data.billNumber || data.bill_number || undefined,
        vendor_id: data.vendorId || data.vendor_id,
        bill_date: data.billDate || data.bill_date,
        due_date: data.dueDate || data.due_date || undefined,
        status: data.status ? (data.status as PurchaseBillStatus) : undefined,
        currency: data.currency || undefined,
        tax_rate: data.taxRate !== undefined ? parseFloat(data.taxRate) : (data.tax_rate !== undefined ? parseFloat(data.tax_rate) : undefined),
        attachment_url: data.attachmentUrl !== undefined ? data.attachmentUrl : (data.attachment_url !== undefined ? data.attachment_url : undefined),
        attachment_name: data.attachmentName !== undefined ? data.attachmentName : (data.attachment_name !== undefined ? data.attachment_name : undefined),
        items: itemsToInclude,
      };
      
      console.log('UpdatePurchaseBill DTO:', {
        hasItems: updateDto.items !== undefined,
        itemsLength: updateDto.items?.length || 0,
        hasAttachmentUrl: updateDto.attachment_url !== undefined,
        hasAttachmentName: updateDto.attachment_name !== undefined,
      });

      const bill = await this.purchaseBillsService.update(data.id, updateDto);
      return this.mapPurchaseBillToProto(bill);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update purchase bill',
      });
    }
  }

  @GrpcMethod('PurchaseBillsService', 'ApprovePurchaseBill')
  async approvePurchaseBill(data: { id: string; approved_by: string; notes?: string }) {
    try {
      const bill = await this.purchaseBillsService.approve(
        data.id,
        data.approved_by,
        data.notes
      );
      return this.mapPurchaseBillToProto(bill);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to approve purchase bill',
      });
    }
  }

  @GrpcMethod('PurchaseBillsService', 'PostPurchaseBill')
  async postPurchaseBill(data: { id: string }) {
    try {
      const result = await this.purchaseBillsService.post(data.id);
      return {
        success: result.success,
        journalEntryId: result.journal_entry_id,
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to post purchase bill',
      });
    }
  }

  @GrpcMethod('PurchaseBillsService', 'DeletePurchaseBill')
  async deletePurchaseBill(data: { id: string }) {
    try {
      await this.purchaseBillsService.remove(data.id);
      return { success: true, message: 'Purchase bill deleted successfully' };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete purchase bill',
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

  private mapPurchaseBillToProto(bill: any) {
    return {
      id: bill.id,
      organizationId: bill.organizationId || '',
      billNumber: bill.billNumber || '',
      vendorId: bill.vendorId || '',
      vendorName: bill.vendorName || '',
      billDate: this.formatDate(bill.billDate),
      dueDate: this.formatDate(bill.dueDate),
      status: bill.status,
      currency: bill.currency || 'USD',
      subtotal: bill.subtotal ? bill.subtotal.toString() : '0',
      taxAmount: bill.taxAmount ? bill.taxAmount.toString() : '0',
      totalAmount: bill.totalAmount ? bill.totalAmount.toString() : '0',
      paidAmount: bill.paidAmount ? bill.paidAmount.toString() : '0',
      balanceDue: bill.balanceDue ? bill.balanceDue.toString() : '0',
      taxRate: bill.taxRate ? bill.taxRate.toString() : '0',
      notes: bill.notes || '',
      attachmentUrl: bill.attachmentUrl || '',
      attachmentName: bill.attachmentName || '',
      approvedBy: bill.approvedBy || '',
      approvedAt: this.formatDateTime(bill.approvedAt),
      journalEntryId: bill.journalEntryId || '',
      postedAt: this.formatDateTime(bill.postedAt),
      items: (bill.items || []).map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity ? item.quantity.toString() : '1',
        unitPrice: item.unitPrice ? item.unitPrice.toString() : '0',
        amount: item.amount ? item.amount.toString() : '0',
        accountId: item.accountId || '',
      })),
      createdDate: this.formatDateTime(bill.createdDate),
      updatedAt: this.formatDateTime(bill.updatedAt),
    };
  }
}

