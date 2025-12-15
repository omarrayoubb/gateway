import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

@Controller()
export class ShipmentsGrpcController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @GrpcMethod('ShipmentsService', 'GetShipment')
  async getShipment(data: { id: string }) {
    try {
      const shipment = await this.shipmentsService.findOne(data.id);
      return this.mapShipmentToProto(shipment);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get shipment',
      });
    }
  }

  @GrpcMethod('ShipmentsService', 'GetShipments')
  async getShipments(data: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    type?: string;
    warehouseId?: string;
    shipmentDate?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.shipmentsService.findAll({
        page,
        limit,
        sort: data.sort,
        status: data.status as any,
        type: data.type as any,
        warehouseId: data.warehouseId,
        shipmentDate: data.shipmentDate,
      });
      console.log('GetShipments result:', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        shipmentCount: result.data.length,
        firstShipmentItemsCount: result.data[0]?.items?.length || 0,
        firstItemHasProduct: result.data[0]?.items?.[0]?.product ? true : false,
      });
      return {
        shipments: result.data.map(shipment => this.mapShipmentToProto(shipment)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error('Error in GetShipments gRPC method:', error);
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get shipments',
      });
    }
  }

  @GrpcMethod('ShipmentsService', 'CreateShipment')
  async createShipment(data: any) {
    try {
      // Helper function to convert empty strings to undefined for optional UUIDs
      const toOptionalUuid = (value: any): string | undefined => {
        if (!value || value === '' || value.trim() === '') return undefined;
        return value;
      };

      const createDto: CreateShipmentDto = {
        shipmentNumber: data.shipmentNumber || data.shipment_number,
        type: data.type,
        warehouseId: data.warehouseId || data.warehouse_id,
        toWarehouseId: toOptionalUuid(data.toWarehouseId || data.to_warehouse_id),
        vendorId: toOptionalUuid(data.vendorId || data.vendor_id),
        customerName: data.customerName || data.customer_name,
        trackingNumber: data.trackingNumber || data.tracking_number,
        carrier: data.carrier,
        shipmentDate: data.shipmentDate || data.shipment_date,
        expectedDelivery: data.expectedDelivery || data.expected_delivery,
        status: data.status || 'pending',
        items: (data.items || []).map((item: any) => ({
          productId: item.productId || item.product_id,
          batchId: toOptionalUuid(item.batchId || item.batch_id),
          quantity: item.quantity,
        })),
        notes: data.notes,
      };
      const shipment = await this.shipmentsService.create(createDto);
      return this.mapShipmentToProto(shipment);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create shipment',
      });
    }
  }

  @GrpcMethod('ShipmentsService', 'UpdateShipment')
  async updateShipment(data: any) {
    try {
      // Helper function to convert empty strings to undefined for optional UUIDs
      const toOptionalUuid = (value: any): string | undefined => {
        if (!value || value === '' || value.trim() === '') return undefined;
        return value;
      };

      const updateDto: UpdateShipmentDto = {
        shipmentNumber: data.shipmentNumber || data.shipment_number,
        type: data.type,
        warehouseId: data.warehouseId || data.warehouse_id,
        toWarehouseId: toOptionalUuid(data.toWarehouseId || data.to_warehouse_id),
        vendorId: toOptionalUuid(data.vendorId || data.vendor_id),
        customerName: data.customerName || data.customer_name,
        trackingNumber: data.trackingNumber || data.tracking_number,
        carrier: data.carrier,
        shipmentDate: data.shipmentDate || data.shipment_date,
        expectedDelivery: data.expectedDelivery || data.expected_delivery,
        status: data.status,
        items: data.items ? (data.items || []).map((item: any) => ({
          productId: item.productId || item.product_id,
          batchId: toOptionalUuid(item.batchId || item.batch_id),
          quantity: item.quantity,
        })) : undefined,
        notes: data.notes,
      };
      const shipment = await this.shipmentsService.update(data.id, updateDto);
      return this.mapShipmentToProto(shipment);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update shipment',
      });
    }
  }

  @GrpcMethod('ShipmentsService', 'DeleteShipment')
  async deleteShipment(data: { id: string }) {
    try {
      await this.shipmentsService.remove(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete shipment',
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

  private mapShipmentToProto(shipment: any) {
    // Debug: Log shipment items to see if products are loaded
    if (shipment.items && shipment.items.length > 0) {
      console.log('Mapping shipment items:', shipment.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        hasProduct: !!item.product,
        productName: item.product?.name,
        productSku: item.product?.sku,
      })));
    }

    const mappedItems = shipment.items?.map((item: any) => {
      // Ensure we have product information
      if (!item.product && item.productId) {
        console.warn(`Product not loaded for shipment item ${item.id}, productId: ${item.productId}`);
      }
      return {
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || '',
        productSku: item.product?.sku || '',
        batchId: item.batchId || '',
        batchNumber: item.batch?.batchNumber || '',
        quantity: item.quantity?.toString() || '0',
      };
    }) || [];

    return {
      id: shipment.id,
      shipmentNumber: shipment.shipmentNumber,
      type: shipment.type,
      warehouseId: shipment.warehouseId,
      warehouseName: shipment.warehouse?.name || '',
      toWarehouseId: shipment.toWarehouseId || '',
      toWarehouseName: shipment.toWarehouse?.name || '',
      vendorId: shipment.vendorId || '',
      vendorName: shipment.vendor?.name || '',
      customerName: shipment.customerName || '',
      trackingNumber: shipment.trackingNumber || '',
      carrier: shipment.carrier || '',
      shipmentDate: this.formatDate(shipment.shipmentDate),
      expectedDelivery: this.formatDate(shipment.expectedDelivery),
      status: shipment.status,
      notes: shipment.notes || '',
      items: mappedItems,
      createdAt: this.formatDateTime(shipment.createdAt),
      updatedAt: this.formatDateTime(shipment.updatedAt),
    };
  }
}

