import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { InventoryBatchesService } from './inventory-batches.service';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/update-inventory-batch.dto';

@Controller()
export class InventoryBatchesGrpcController {
  constructor(private readonly batchesService: InventoryBatchesService) {}

  @GrpcMethod('InventoryBatchesService', 'GetInventoryBatch')
  async getInventoryBatch(data: { id: string }) {
    try {
      const batch = await this.batchesService.findOne(data.id);
      return this.mapBatchToProto(batch);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND : UNKNOWN
        message: error.message || 'Failed to get inventory batch',
      });
    }
  }

  @GrpcMethod('InventoryBatchesService', 'GetInventoryBatches')
  async getInventoryBatches(data: {
    page?: number;
    limit?: number;
    sort?: string;
    productId?: string;
    warehouseId?: string;
    status?: string;
    batchNumber?: string;
    search?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      // Handle both camelCase (from proto) and snake_case (for backward compatibility)
      const result = await this.batchesService.findAll({
        page,
        limit,
        sort: data.sort,
        product_id: data.productId || (data as any).product_id,
        warehouse_id: data.warehouseId || (data as any).warehouse_id,
        status: data.status as any,
        batch_number: data.batchNumber || (data as any).batch_number,
        search: data.search,
      });
      return {
        batches: result.data.map(batch => this.mapBatchToProto(batch)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2, // UNKNOWN
        message: error.message || 'Failed to get inventory batches',
      });
    }
  }

  @GrpcMethod('InventoryBatchesService', 'CreateInventoryBatch')
  async createInventoryBatch(data: any) {
    try {
      // Proto now uses camelCase, prioritize camelCase but support snake_case for backward compatibility
      const productId = data.productId || data.product_id;
      const warehouseId = data.warehouseId || data.warehouse_id;
      const batchNumber = data.batchNumber || data.batch_number;
      
      if (!productId) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'productId is required',
        });
      }
      
      if (!warehouseId) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'warehouseId is required',
        });
      }
      
      if (!batchNumber) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'batchNumber is required',
        });
      }
      
      const createDto: CreateInventoryBatchDto = {
        product_id: productId,
        warehouse_id: warehouseId,
        batch_number: batchNumber,
        barcode: data.barcode || undefined,
        quantity_available: (data.quantityAvailable || data.quantity_available) ? parseFloat(data.quantityAvailable || data.quantity_available) : 0,
        unit_cost: (data.unitCost || data.unit_cost) ? parseFloat(data.unitCost || data.unit_cost) : 0,
        manufacturing_date: data.manufacturingDate || data.manufacturing_date || undefined,
        expiry_date: data.expiryDate || data.expiry_date || undefined,
        received_date: data.receivedDate || data.received_date || undefined,
        location: data.location || undefined,
        status: data.status,
      };
      const batch = await this.batchesService.create(createDto);
      return this.mapBatchToProto(batch);
    } catch (error) {
      if (error.code) {
        // Already an RpcException, re-throw it
        throw error;
      }
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create inventory batch',
      });
    }
  }

  @GrpcMethod('InventoryBatchesService', 'UpdateInventoryBatch')
  async updateInventoryBatch(data: any) {
    try {
      // Proto now uses camelCase, prioritize camelCase but support snake_case for backward compatibility
      const updateDto: UpdateInventoryBatchDto = {
        product_id: data.productId || data.product_id,
        warehouse_id: data.warehouseId || data.warehouse_id,
        batch_number: data.batchNumber || data.batch_number,
        barcode: data.barcode,
        quantity_available: (data.quantityAvailable || data.quantity_available) ? parseFloat(data.quantityAvailable || data.quantity_available) : undefined,
        unit_cost: (data.unitCost || data.unit_cost) ? parseFloat(data.unitCost || data.unit_cost) : undefined,
        manufacturing_date: data.manufacturingDate || data.manufacturing_date,
        expiry_date: data.expiryDate || data.expiry_date,
        received_date: data.receivedDate || data.received_date,
        location: data.location,
        status: data.status,
      };
      const batch = await this.batchesService.update(data.id, updateDto);
      return this.mapBatchToProto(batch);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update inventory batch',
      });
    }
  }

  @GrpcMethod('InventoryBatchesService', 'DeleteInventoryBatch')
  async deleteInventoryBatch(data: { id: string }) {
    try {
      await this.batchesService.remove(data.id);
      return { success: true, message: 'Inventory batch deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2; // NOT_FOUND : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete inventory batch',
      });
    }
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      // If it's already a string, try to parse it and format it
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
      // If it's already a string, try to parse it and format it
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

  private mapBatchToProto(batch: any) {
    // Debug: Log batch to see if relations are loaded
    console.log('Mapping batch:', {
      id: batch.id,
      hasProduct: !!batch.product,
      hasWarehouse: !!batch.warehouse,
      productId: batch.productId,
      warehouseId: batch.warehouseId,
      productName: batch.product?.name,
      warehouseName: batch.warehouse?.name,
      receivedDateType: typeof batch.receivedDate,
      receivedDateValue: batch.receivedDate,
    });
    
    if (!batch.product && batch.productId) {
      console.warn(`Product relation not loaded for batch ${batch.id}, productId: ${batch.productId}`);
    }
    if (!batch.warehouse && batch.warehouseId) {
      console.warn(`Warehouse relation not loaded for batch ${batch.id}, warehouseId: ${batch.warehouseId}`);
    }
    
    // Return camelCase to match proto definition
    return {
      id: batch.id,
      productId: batch.productId || batch.product?.id || '',
      productName: batch.product?.name || '',
      productSku: batch.product?.sku || '',
      warehouseId: batch.warehouseId || batch.warehouse?.id || '',
      warehouseName: batch.warehouse?.name || '',
      warehouseCode: batch.warehouse?.code || '',
      batchNumber: batch.batchNumber,
      barcode: batch.barcode || '',
      quantityAvailable: batch.quantityAvailable?.toString() || '0',
      unitCost: batch.unitCost?.toString() || '0',
      manufacturingDate: this.formatDate(batch.manufacturingDate),
      expiryDate: this.formatDate(batch.expiryDate),
      receivedDate: this.formatDate(batch.receivedDate),
      location: batch.location || '',
      status: batch.status,
      createdAt: this.formatDateTime(batch.createdAt),
      updatedAt: this.formatDateTime(batch.updatedAt),
    };
  }
}

