import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { MovementType, ReferenceType } from './entities/stock-movement.entity';

@Controller()
export class StockMovementsGrpcController {
  constructor(private readonly movementsService: StockMovementsService) {}

  @GrpcMethod('StockMovementsService', 'GetStockMovement')
  async getStockMovement(data: { id: string }) {
    try {
      const movement = await this.movementsService.findOne(data.id);
      return this.mapMovementToProto(movement);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND : UNKNOWN
        message: error.message || 'Failed to get stock movement',
      });
    }
  }

  @GrpcMethod('StockMovementsService', 'GetStockMovements')
  async getStockMovements(data: {
    page?: number;
    limit?: number;
    sort?: string;
    productId?: string;
    batchId?: string;
    warehouseId?: string;
    movementType?: string;
    movementDate?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      // Handle both camelCase (from proto) and snake_case (for backward compatibility)
      const result = await this.movementsService.findAll({
        page,
        limit,
        sort: data.sort,
        product_id: data.productId || (data as any).product_id,
        batch_id: data.batchId || (data as any).batch_id,
        warehouse_id: data.warehouseId || (data as any).warehouse_id,
        movement_type: data.movementType ? (data.movementType as MovementType) : undefined,
        movement_date: data.movementDate || (data as any).movement_date,
      });
      return {
        movements: result.data.map(movement => this.mapMovementToProto(movement)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2, // UNKNOWN
        message: error.message || 'Failed to get stock movements',
      });
    }
  }

  @GrpcMethod('StockMovementsService', 'CreateStockMovement')
  async createStockMovement(data: any) {
    try {
      // Proto now uses camelCase, prioritize camelCase but support snake_case for backward compatibility
      const productId = data.productId || data.product_id;
      const batchId = data.batchId || data.batch_id;
      const warehouseId = data.warehouseId || data.warehouse_id;
      const movementType = data.movementType || data.movement_type;
      
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
      
      if (!movementType) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'movementType is required',
        });
      }
      
      const createDto: CreateStockMovementDto = {
        product_id: productId,
        batch_id: batchId || undefined,
        warehouse_id: warehouseId,
        movement_type: movementType as MovementType,
        quantity: (data.quantity || data.quantity === 0) ? parseFloat(data.quantity) : 0,
        reference_type: (data.referenceType || data.reference_type) ? (data.referenceType || data.reference_type) as ReferenceType : undefined,
        reference_id: data.referenceId || data.reference_id || undefined,
        movement_date: data.movementDate || data.movement_date || undefined,
        notes: data.notes || undefined,
        user_id: data.userId || data.user_id || undefined,
      };
      const movement = await this.movementsService.create(createDto);
      return this.mapMovementToProto(movement);
    } catch (error) {
      if (error.code) {
        // Already an RpcException, re-throw it
        throw error;
      }
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create stock movement',
      });
    }
  }

  @GrpcMethod('StockMovementsService', 'UpdateStockMovement')
  async updateStockMovement(data: any) {
    try {
      // Proto now uses camelCase, prioritize camelCase but support snake_case for backward compatibility
      const updateDto: UpdateStockMovementDto = {
        product_id: data.productId || data.product_id,
        batch_id: data.batchId || data.batch_id,
        warehouse_id: data.warehouseId || data.warehouse_id,
        movement_type: data.movementType ? (data.movementType as MovementType) : undefined,
        quantity: (data.quantity !== undefined) ? parseFloat(data.quantity) : undefined,
        reference_type: data.referenceType ? (data.referenceType as ReferenceType) : undefined,
        reference_id: data.referenceId || data.reference_id,
        movement_date: data.movementDate || data.movement_date,
        notes: data.notes,
        user_id: data.userId || data.user_id,
      };
      const movement = await this.movementsService.update(data.id, updateDto);
      return this.mapMovementToProto(movement);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update stock movement',
      });
    }
  }

  @GrpcMethod('StockMovementsService', 'DeleteStockMovement')
  async deleteStockMovement(data: { id: string }) {
    try {
      await this.movementsService.remove(data.id);
      return { success: true, message: 'Stock movement deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2; // NOT_FOUND : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete stock movement',
      });
    }
  }

  private mapMovementToProto(movement: any) {
    // Debug: Log movement to see if relations are loaded
    if (movement && !movement.product && movement.productId) {
      console.warn(`Product relation not loaded for movement ${movement.id}, productId: ${movement.productId}`);
    }
    if (movement && !movement.warehouse && movement.warehouseId) {
      console.warn(`Warehouse relation not loaded for movement ${movement.id}, warehouseId: ${movement.warehouseId}`);
    }
    
    // Return camelCase to match proto definition
    return {
      id: movement.id,
      productId: movement.productId || movement.product?.id || '',
      productName: movement.product?.name || '',
      productSku: movement.product?.sku || '',
      batchId: movement.batchId || movement.batch?.id || '',
      batchNumber: movement.batch?.batchNumber || '',
      warehouseId: movement.warehouseId || movement.warehouse?.id || '',
      warehouseName: movement.warehouse?.name || '',
      warehouseCode: movement.warehouse?.code || '',
      movementType: movement.movementType,
      quantity: movement.quantity?.toString() || '0',
      referenceType: movement.referenceType || '',
      referenceId: movement.referenceId || '',
      movementDate: movement.movementDate?.toISOString() || '',
      notes: movement.notes || '',
      userId: movement.userId || '',
      createdAt: movement.createdAt?.toISOString() || '',
      updatedAt: movement.updatedAt?.toISOString() || '',
    };
  }
}

