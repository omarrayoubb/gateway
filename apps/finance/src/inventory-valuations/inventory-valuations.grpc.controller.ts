import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { InventoryValuationsService } from './inventory-valuations.service';
import { CreateInventoryValuationDto } from './dto/create-inventory-valuation.dto';
import { UpdateInventoryValuationDto } from './dto/update-inventory-valuation.dto';
import { InventoryValuationPaginationDto } from './dto/pagination.dto';
import { ValuationMethod } from './entities/inventory-valuation.entity';

@Controller()
export class InventoryValuationsGrpcController {
  constructor(private readonly inventoryValuationsService: InventoryValuationsService) {}

  @GrpcMethod('InventoryValuationsService', 'GetInventoryValuations')
  async getInventoryValuations(data: { as_of_date?: string; valuation_method?: string }) {
    try {
      const query: InventoryValuationPaginationDto = {
        as_of_date: data.as_of_date,
        valuation_method: data.valuation_method as ValuationMethod,
      };

      const valuations = await this.inventoryValuationsService.findAll(query);
      return {
        valuations: valuations.map(valuation => this.mapValuationToProto(valuation)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get inventory valuations',
      });
    }
  }

  @GrpcMethod('InventoryValuationsService', 'GetInventoryValuation')
  async getInventoryValuation(data: { id: string }) {
    try {
      const valuation = await this.inventoryValuationsService.findOne(data.id);
      return this.mapValuationToProto(valuation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get inventory valuation',
      });
    }
  }

  @GrpcMethod('InventoryValuationsService', 'CreateInventoryValuation')
  async createInventoryValuation(data: any) {
    try {
      const createDto: CreateInventoryValuationDto = {
        organization_id: data.organizationId || data.organization_id,
        item_id: data.itemId || data.item_id,
        valuation_date: data.valuationDate || data.valuation_date,
        valuation_method: (data.valuationMethod || data.valuation_method) as ValuationMethod,
        quantity: parseFloat(data.quantity || '0'),
        unit_cost: parseFloat(data.unitCost || data.unit_cost || '0'),
      };

      const valuation = await this.inventoryValuationsService.create(createDto);
      return this.mapValuationToProto(valuation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create inventory valuation',
      });
    }
  }

  @GrpcMethod('InventoryValuationsService', 'UpdateInventoryValuation')
  async updateInventoryValuation(data: any) {
    try {
      const id = data.id;
      const updateDto: UpdateInventoryValuationDto = {};

      if (data.valuationDate || data.valuation_date) {
        updateDto.valuation_date = data.valuationDate || data.valuation_date;
      }
      if (data.valuationMethod || data.valuation_method) {
        updateDto.valuation_method = (data.valuationMethod || data.valuation_method) as ValuationMethod;
      }
      if (data.quantity !== undefined) {
        updateDto.quantity = parseFloat(data.quantity || '0');
      }
      if (data.unitCost !== undefined || data.unit_cost !== undefined) {
        updateDto.unit_cost = parseFloat(data.unitCost || data.unit_cost || '0');
      }

      const valuation = await this.inventoryValuationsService.update(id, updateDto);
      return this.mapValuationToProto(valuation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update inventory valuation',
      });
    }
  }

  @GrpcMethod('InventoryValuationsService', 'DeleteInventoryValuation')
  async deleteInventoryValuation(data: { id: string }) {
    try {
      await this.inventoryValuationsService.remove(data.id);
      return { success: true, message: 'Inventory valuation deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete inventory valuation',
      });
    }
  }

  @GrpcMethod('InventoryValuationsService', 'CalculateInventoryValuation')
  async calculateInventoryValuation(data: { as_of_date: string; valuation_method: string }) {
    try {
      if (!data.as_of_date) {
        throw new RpcException({
          code: 3,
          message: 'as_of_date is required',
        });
      }
      if (!data.valuation_method) {
        throw new RpcException({
          code: 3,
          message: 'valuation_method is required',
        });
      }

      const result = await this.inventoryValuationsService.calculate(
        data.as_of_date,
        data.valuation_method as ValuationMethod,
      );

      return {
        as_of_date: result.as_of_date,
        valuation_method: result.valuation_method,
        total_inventory_value: result.total_inventory_value.toString(),
        items: result.items.map((item: any) => ({
          item_id: item.item_id,
          item_code: item.item_code || '',
          item_name: item.item_name || '',
          quantity: item.quantity.toString(),
          unit_cost: item.unit_cost.toString(),
          total_value: item.total_value.toString(),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to calculate inventory valuation',
      });
    }
  }

  @GrpcMethod('InventoryValuationsService', 'SyncInventoryValuations')
  async syncInventoryValuations(data: { valuation_method?: string; batches?: any[] }) {
    try {
      const valuationMethod = (data.valuation_method || 'fifo') as ValuationMethod;
      
      if (data.batches && data.batches.length > 0) {
        // Sync from provided batches
        const result = await this.inventoryValuationsService.syncFromBatches(data.batches, valuationMethod);
        return {
          success: true,
          message: `Sync completed. Created: ${result.created}, Updated: ${result.updated}`,
          total_created: result.created,
          total_updated: result.updated,
          errors: result.errors,
        };
      } else {
        throw new RpcException({
          code: 3,
          message: 'batches array is required for sync',
        });
      }
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to sync inventory valuations',
      });
    }
  }

  private mapValuationToProto(valuation: any): any {
    let valuationDateStr = '';
    if (valuation.valuationDate) {
      if (valuation.valuationDate instanceof Date) {
        valuationDateStr = valuation.valuationDate.toISOString().split('T')[0];
      } else if (typeof valuation.valuationDate === 'string') {
        // If it's already a string, try to format it
        const date = new Date(valuation.valuationDate);
        if (!isNaN(date.getTime())) {
          valuationDateStr = date.toISOString().split('T')[0];
        } else {
          valuationDateStr = valuation.valuationDate.split('T')[0]; // Take date part if already formatted
        }
      }
    }

    return {
      id: valuation.id,
      organizationId: valuation.organizationId || '',
      itemId: valuation.itemId || '',
      itemCode: valuation.itemCode || '',
      itemName: valuation.itemName || '',
      valuationDate: valuationDateStr,
      valuationMethod: valuation.valuationMethod,
      quantity: valuation.quantity ? valuation.quantity.toString() : '0',
      unitCost: valuation.unitCost ? valuation.unitCost.toString() : '0',
      totalValue: valuation.totalValue ? valuation.totalValue.toString() : '0',
      currency: valuation.currency || 'USD',
    };
  }
}

