import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { DeliveryNotesService } from './delivery-notes.service';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/update-delivery-note.dto';

@Controller()
export class DeliveryNotesGrpcController {
  constructor(private readonly deliveryNotesService: DeliveryNotesService) {}

  @GrpcMethod('DeliveryNotesService', 'GetDeliveryNote')
  async getDeliveryNote(data: { id: string }) {
    try {
      const deliveryNote = await this.deliveryNotesService.findOne(data.id);
      return this.mapDeliveryNoteToProto(deliveryNote);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get delivery note',
      });
    }
  }

  @GrpcMethod('DeliveryNotesService', 'GetDeliveryNotes')
  async getDeliveryNotes(data: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    deliveredTo?: string;
    date?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 50;
      const result = await this.deliveryNotesService.findAll({
        page,
        limit,
        sort: data.sort,
        status: data.status,
        deliveredTo: data.deliveredTo,
        date: data.date,
      });
      return {
        deliveryNotes: result.data.map(dn => this.mapDeliveryNoteToProto(dn)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error('Error in GetDeliveryNotes gRPC method:', error);
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get delivery notes',
      });
    }
  }

  @GrpcMethod('DeliveryNotesService', 'CreateDeliveryNote')
  async createDeliveryNote(data: any) {
    try {
      const createDto: CreateDeliveryNoteDto = {
        dnNumber: data.dnNumber || data.dn_number,
        deliveredTo: data.deliveredTo || data.delivered_to,
        date: data.date,
        taxCard: data.taxCard || data.tax_card,
        cr: data.cr,
        items: (data.items || []).map((item: any) => ({
          productId: item.productId || item.product_id,
          batchId: item.batchId || item.batch_id,
          quantity: item.quantity,
        })),
      };
      const deliveryNote = await this.deliveryNotesService.create(createDto);
      return this.mapDeliveryNoteToProto(deliveryNote);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create delivery note',
      });
    }
  }

  @GrpcMethod('DeliveryNotesService', 'UpdateDeliveryNote')
  async updateDeliveryNote(data: any) {
    try {
      const updateDto: UpdateDeliveryNoteDto = {
        dnNumber: data.dnNumber || data.dn_number,
        deliveredTo: data.deliveredTo || data.delivered_to,
        date: data.date,
        taxCard: data.taxCard || data.tax_card,
        cr: data.cr,
        items: data.items ? (data.items || []).map((item: any) => ({
          productId: item.productId || item.product_id,
          batchId: item.batchId || item.batch_id,
          quantity: item.quantity,
        })) : undefined,
      };
      const deliveryNote = await this.deliveryNotesService.update(data.id, updateDto);
      return this.mapDeliveryNoteToProto(deliveryNote);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update delivery note',
      });
    }
  }

  @GrpcMethod('DeliveryNotesService', 'DeleteDeliveryNote')
  async deleteDeliveryNote(data: { id: string }) {
    try {
      await this.deliveryNotesService.remove(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete delivery note',
      });
    }
  }

  @GrpcMethod('DeliveryNotesService', 'GetProductsWithInventory')
  async getProductsWithInventory(data: { warehouseId?: string }) {
    try {
      const products = await this.deliveryNotesService.getProductsWithInventory(data.warehouseId);
      const mappedProducts = products.map(product => ({
        id: product.id,
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        totalAvailable: product.totalAvailable?.toString() || '0',
        batches: (product.batches || []).map((batch: any) => ({
          id: batch.id,
          batchNumber: batch.batchNumber || '',
          warehouseId: batch.warehouseId || '',
          warehouseName: batch.warehouseName || '',
          quantityAvailable: batch.quantityAvailable?.toString() || '0',
          expiryDate: batch.expiryDate ? this.formatDate(batch.expiryDate) : '',
          unitCost: batch.unitCost?.toString() || '0',
        })),
      }));
      return { products: mappedProducts };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get products with inventory',
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

  private mapDeliveryNoteToProto(deliveryNote: any) {
    const mappedItems = deliveryNote.items?.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name || '',
      productSku: item.product?.sku || '',
      batchId: item.batchId || '',
      batchNumber: item.batch?.batchNumber || '',
      quantity: item.quantity?.toString() || '0',
    })) || [];

    return {
      id: deliveryNote.id,
      dnNumber: deliveryNote.dnNumber,
      deliveredTo: deliveryNote.deliveredTo,
      date: this.formatDateTime(deliveryNote.date),
      taxCard: deliveryNote.taxCard || '',
      cr: deliveryNote.cr || '',
      items: mappedItems,
      createdAt: this.formatDateTime(deliveryNote.createdAt),
      updatedAt: this.formatDateTime(deliveryNote.updatedAt),
    };
  }
}

