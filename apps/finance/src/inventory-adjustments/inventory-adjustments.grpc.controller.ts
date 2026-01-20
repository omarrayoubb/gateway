import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { InventoryAdjustmentsService } from './inventory-adjustments.service';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { UpdateInventoryAdjustmentDto } from './dto/update-inventory-adjustment.dto';
import { InventoryAdjustmentPaginationDto } from './dto/pagination.dto';

@Controller()
export class InventoryAdjustmentsGrpcController {
  constructor(private readonly inventoryAdjustmentsService: InventoryAdjustmentsService) {}

  @GrpcMethod('InventoryAdjustmentsService', 'GetInventoryAdjustments')
  async getInventoryAdjustments(data: { sort?: string; adjustment_type?: string }) {
    try {
      const query: InventoryAdjustmentPaginationDto = {
        sort: data.sort,
        adjustment_type: data.adjustment_type as any,
      };

      const adjustments = await this.inventoryAdjustmentsService.findAll(query);
      return {
        adjustments: adjustments.map(adjustment => this.mapAdjustmentToProto(adjustment)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get inventory adjustments',
      });
    }
  }

  @GrpcMethod('InventoryAdjustmentsService', 'GetInventoryAdjustment')
  async getInventoryAdjustment(data: { id: string }) {
    try {
      const adjustment = await this.inventoryAdjustmentsService.findOne(data.id);
      return this.mapAdjustmentToProto(adjustment);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get inventory adjustment',
      });
    }
  }

  @GrpcMethod('InventoryAdjustmentsService', 'CreateInventoryAdjustment')
  async createInventoryAdjustment(data: any) {
    try {
      const createDto: CreateInventoryAdjustmentDto = {
        organization_id: data.organizationId || data.organization_id,
        adjustment_number: data.adjustmentNumber || data.adjustment_number,
        adjustment_date: data.adjustmentDate || data.adjustment_date,
        adjustment_type: data.adjustmentType || data.adjustment_type,
        item_id: data.itemId || data.item_id,
        quantity_adjusted: data.quantityAdjusted !== undefined ? parseFloat(data.quantityAdjusted.toString()) : data.quantity_adjusted,
        unit_cost: data.unitCost !== undefined ? parseFloat(data.unitCost.toString()) : data.unit_cost,
        adjustment_amount: data.adjustmentAmount !== undefined ? parseFloat(data.adjustmentAmount.toString()) : data.adjustment_amount,
        account_id: data.accountId || data.account_id,
        reason: data.reason,
      };

      const adjustment = await this.inventoryAdjustmentsService.create(createDto);
      return this.mapAdjustmentToProto(adjustment);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create inventory adjustment',
      });
    }
  }

  @GrpcMethod('InventoryAdjustmentsService', 'UpdateInventoryAdjustment')
  async updateInventoryAdjustment(data: any) {
    try {
      const updateDto: UpdateInventoryAdjustmentDto = {
        adjustment_date: data.adjustmentDate || data.adjustment_date,
        adjustment_type: data.adjustmentType || data.adjustment_type,
        item_id: data.itemId || data.item_id,
        quantity_adjusted: data.quantityAdjusted !== undefined ? parseFloat(data.quantityAdjusted.toString()) : data.quantity_adjusted,
        unit_cost: data.unitCost !== undefined ? parseFloat(data.unitCost.toString()) : data.unit_cost,
        adjustment_amount: data.adjustmentAmount !== undefined ? parseFloat(data.adjustmentAmount.toString()) : data.adjustment_amount,
        account_id: data.accountId || data.account_id,
        reason: data.reason,
      };

      const adjustment = await this.inventoryAdjustmentsService.update(data.id, updateDto);
      return this.mapAdjustmentToProto(adjustment);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update inventory adjustment',
      });
    }
  }

  @GrpcMethod('InventoryAdjustmentsService', 'DeleteInventoryAdjustment')
  async deleteInventoryAdjustment(data: { id: string }) {
    try {
      await this.inventoryAdjustmentsService.remove(data.id);
      return { success: true, message: 'Inventory adjustment deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete inventory adjustment',
      });
    }
  }

  @GrpcMethod('InventoryAdjustmentsService', 'PostInventoryAdjustment')
  async postInventoryAdjustment(data: { id: string }) {
    try {
      const result = await this.inventoryAdjustmentsService.post(data.id);
      return {
        success: result.success,
        journal_entry_id: result.journal_entry_id,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to post inventory adjustment',
      });
    }
  }

  private mapAdjustmentToProto(adjustment: any): any {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      if (typeof date === 'string') {
        return date.split('T')[0];
      }
      return '';
    };

    return {
      id: adjustment.id,
      organizationId: adjustment.organizationId || '',
      adjustmentNumber: adjustment.adjustmentNumber || '',
      adjustmentDate: formatDate(adjustment.adjustmentDate),
      adjustmentType: adjustment.adjustmentType,
      itemId: adjustment.itemId || '',
      itemCode: adjustment.itemCode || '',
      quantityAdjusted: adjustment.quantityAdjusted?.toString() || '0',
      unitCost: adjustment.unitCost?.toString() || '0',
      adjustmentAmount: adjustment.adjustmentAmount?.toString() || '0',
      accountId: adjustment.accountId || '',
      reason: adjustment.reason || '',
      status: adjustment.status,
      journalEntryId: adjustment.journalEntryId || '',
    };
  }
}

