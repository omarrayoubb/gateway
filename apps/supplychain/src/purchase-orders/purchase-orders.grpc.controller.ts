import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Controller()
export class PurchaseOrdersGrpcController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @GrpcMethod('PurchaseOrdersService', 'GetPurchaseOrder')
  async getPurchaseOrder(data: { id: string }) {
    try {
      const purchaseOrder = await this.purchaseOrdersService.findOne(data.id);
      return this.mapPurchaseOrderToProto(purchaseOrder);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get purchase order',
      });
    }
  }

  @GrpcMethod('PurchaseOrdersService', 'GetPurchaseOrders')
  async getPurchaseOrders(data: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    vendorId?: string;
    warehouseId?: string;
    orderDate?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.purchaseOrdersService.findAll({
        page,
        limit,
        sort: data.sort,
        status: data.status as any,
        vendorId: data.vendorId,
        warehouseId: data.warehouseId,
        orderDate: data.orderDate,
      });
      console.log('GetPurchaseOrders result:', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        purchaseOrderCount: result.data.length,
        firstPOItemsCount: result.data[0]?.items?.length || 0,
        firstItemHasProduct: result.data[0]?.items?.[0]?.product ? true : false,
      });
      return {
        purchaseOrders: result.data.map(po => this.mapPurchaseOrderToProto(po)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error('Error in GetPurchaseOrders gRPC method:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get purchase orders',
      });
    }
  }

  @GrpcMethod('PurchaseOrdersService', 'CreatePurchaseOrder')
  async createPurchaseOrder(data: any) {
    try {
      const createDto: CreatePurchaseOrderDto = {
        poNumber: data.poNumber || data.po_number,
        vendorId: data.vendorId || data.vendor_id,
        warehouseId: data.warehouseId || data.warehouse_id,
        orderDate: data.orderDate || data.order_date,
        expectedDeliveryDate: data.expectedDeliveryDate || data.expected_delivery_date,
        items: (data.items || []).map((item: any) => ({
          productId: item.productId || item.product_id,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.unit_price,
          total: item.total,
        })),
        subtotal: data.subtotal,
        tax: data.tax,
        totalAmount: data.totalAmount || data.total_amount,
        status: data.status || 'draft',
        notes: data.notes,
      };
      const purchaseOrder = await this.purchaseOrdersService.create(createDto);
      return this.mapPurchaseOrderToProto(purchaseOrder);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create purchase order',
      });
    }
  }

  @GrpcMethod('PurchaseOrdersService', 'UpdatePurchaseOrder')
  async updatePurchaseOrder(data: any) {
    try {
      const updateDto: UpdatePurchaseOrderDto = {
        poNumber: data.poNumber || data.po_number,
        vendorId: data.vendorId || data.vendor_id,
        warehouseId: data.warehouseId || data.warehouse_id,
        orderDate: data.orderDate || data.order_date,
        expectedDeliveryDate: data.expectedDeliveryDate || data.expected_delivery_date,
        items: data.items ? (data.items || []).map((item: any) => ({
          productId: item.productId || item.product_id,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.unit_price,
          total: item.total,
        })) : undefined,
        subtotal: data.subtotal,
        tax: data.tax,
        totalAmount: data.totalAmount || data.total_amount,
        status: data.status,
        notes: data.notes,
        approvalStatus: data.approvalStatus || data.approval_status,
        requiresApproval: data.requiresApproval !== undefined ? data.requiresApproval : (data.requires_approval !== undefined ? data.requires_approval : undefined),
        submittedForApprovalBy: data.submittedForApprovalBy || data.submitted_for_approval_by,
        submittedForApprovalAt: data.submittedForApprovalAt || data.submitted_for_approval_at,
        approvedBy: data.approvedBy || data.approved_by,
        approvedAt: data.approvedAt || data.approved_at,
      };
      const purchaseOrder = await this.purchaseOrdersService.update(data.id, updateDto);
      return this.mapPurchaseOrderToProto(purchaseOrder);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update purchase order',
      });
    }
  }

  @GrpcMethod('PurchaseOrdersService', 'DeletePurchaseOrder')
  async deletePurchaseOrder(data: { id: string }) {
    try {
      await this.purchaseOrdersService.remove(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete purchase order',
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

  private mapPurchaseOrderToProto(purchaseOrder: any) {
    // Debug: Log purchase order items to see if products are loaded
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      console.log('Mapping purchase order items:', purchaseOrder.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        hasProduct: !!item.product,
        productName: item.product?.name,
        productSku: item.product?.sku,
      })));
    }

    const mappedItems = purchaseOrder.items?.map((item: any) => {
      // Ensure we have product information
      if (!item.product && item.productId) {
        console.warn(`Product not loaded for purchase order item ${item.id}, productId: ${item.productId}`);
      }
      return {
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || '',
        productSku: item.product?.sku || '',
        quantity: item.quantity?.toString() || '0',
        unitPrice: item.unitPrice?.toString() || '0',
        total: item.total?.toString() || '0',
      };
    }) || [];

    return {
      id: purchaseOrder.id,
      poNumber: purchaseOrder.poNumber,
      vendorId: purchaseOrder.vendorId,
      vendorName: purchaseOrder.vendor?.name || '',
      warehouseId: purchaseOrder.warehouseId,
      warehouseName: purchaseOrder.warehouse?.name || '',
      orderDate: this.formatDate(purchaseOrder.orderDate),
      expectedDeliveryDate: this.formatDate(purchaseOrder.expectedDeliveryDate),
      subtotal: purchaseOrder.subtotal?.toString() || '0',
      tax: purchaseOrder.tax?.toString() || '0',
      totalAmount: purchaseOrder.totalAmount?.toString() || '0',
      status: purchaseOrder.status,
      notes: purchaseOrder.notes || '',
      approvalStatus: purchaseOrder.approvalStatus || '',
      requiresApproval: purchaseOrder.requiresApproval ? 'true' : 'false',
      submittedForApprovalBy: purchaseOrder.submittedForApprovalBy || '',
      submittedForApprovalAt: this.formatDateTime(purchaseOrder.submittedForApprovalAt),
      approvedBy: purchaseOrder.approvedBy || '',
      approvedAt: this.formatDateTime(purchaseOrder.approvedAt),
      items: mappedItems,
      createdAt: this.formatDateTime(purchaseOrder.createdAt),
      updatedAt: this.formatDateTime(purchaseOrder.updatedAt),
    };
  }
}

