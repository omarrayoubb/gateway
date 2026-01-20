import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { StockImpactsService } from './stock-impacts.service';
import { CreateStockImpactDto } from './dto/create-stock-impact.dto';
import { UpdateStockImpactDto } from './dto/update-stock-impact.dto';
import { StockImpactPaginationDto } from './dto/pagination.dto';
import { CalculateStockImpactDto } from './dto/calculate-stock-impact.dto';

@Controller()
export class StockImpactsGrpcController {
  constructor(private readonly stockImpactsService: StockImpactsService) {}

  @GrpcMethod('StockImpactsService', 'GetStockImpacts')
  async getStockImpacts(data: { periodstart?: string; periodend?: string; period_start?: string; period_end?: string }) {
    try {
      const query: StockImpactPaginationDto = {
        period_start: data.periodstart || data.period_start,
        period_end: data.periodend || data.period_end,
      };

      const stockImpacts = await this.stockImpactsService.findAll(query);
      return {
        stockImpacts: stockImpacts.map(impact => this.mapStockImpactToProto(impact)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get stock impacts',
      });
    }
  }

  @GrpcMethod('StockImpactsService', 'GetStockImpact')
  async getStockImpact(data: { id: string }) {
    try {
      const stockImpact = await this.stockImpactsService.findOne(data.id);
      return this.mapStockImpactToProto(stockImpact);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get stock impact',
      });
    }
  }

  @GrpcMethod('StockImpactsService', 'CreateStockImpact')
  async createStockImpact(data: any) {
    try {
      const createDto: CreateStockImpactDto = {
        organization_id: data.organizationId || data.organization_id,
        transaction_date: data.transactionDate || data.transaction_date,
        transaction_type: data.transactionType || data.transaction_type,
        item_id: data.itemId || data.item_id,
        quantity: data.quantity !== undefined ? parseFloat(data.quantity.toString()) : data.quantity,
        unit_cost: data.unitCost !== undefined ? parseFloat(data.unitCost.toString()) : data.unit_cost,
        total_cost: data.totalCost !== undefined ? parseFloat(data.totalCost.toString()) : data.total_cost,
        inventory_account_id: data.inventoryAccountId || data.inventory_account_id,
        cogs_account_id: data.cogsAccountId || data.cogs_account_id,
        expense_account_id: data.expenseAccountId || data.expense_account_id,
        reference_id: data.referenceId || data.reference_id,
        reference_type: data.referenceType || data.reference_type,
      };

      const stockImpact = await this.stockImpactsService.create(createDto);
      return this.mapStockImpactToProto(stockImpact);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create stock impact',
      });
    }
  }

  @GrpcMethod('StockImpactsService', 'UpdateStockImpact')
  async updateStockImpact(data: any) {
    try {
      const updateDto: UpdateStockImpactDto = {
        transaction_date: data.transactionDate || data.transaction_date,
        transaction_type: data.transactionType || data.transaction_type,
        item_id: data.itemId || data.item_id,
        quantity: data.quantity !== undefined ? parseFloat(data.quantity.toString()) : data.quantity,
        unit_cost: data.unitCost !== undefined ? parseFloat(data.unitCost.toString()) : data.unit_cost,
        total_cost: data.totalCost !== undefined ? parseFloat(data.totalCost.toString()) : data.total_cost,
        inventory_account_id: data.inventoryAccountId || data.inventory_account_id,
        cogs_account_id: data.cogsAccountId || data.cogs_account_id,
        expense_account_id: data.expenseAccountId || data.expense_account_id,
        reference_id: data.referenceId || data.reference_id,
        reference_type: data.referenceType || data.reference_type,
      };

      const stockImpact = await this.stockImpactsService.update(data.id, updateDto);
      return this.mapStockImpactToProto(stockImpact);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update stock impact',
      });
    }
  }

  @GrpcMethod('StockImpactsService', 'DeleteStockImpact')
  async deleteStockImpact(data: { id: string }) {
    try {
      await this.stockImpactsService.remove(data.id);
      return { success: true, message: 'Stock impact deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete stock impact',
      });
    }
  }

  @GrpcMethod('StockImpactsService', 'CalculateStockImpacts')
  async calculateStockImpacts(data: any) {
    try {
      // Support both proto format (periodstart, periodend) and snake_case (period_start, period_end)
      const periodStart = data.periodstart || data.periodStart || data.period_start || '';
      const periodEnd = data.periodend || data.periodEnd || data.period_end || '';
      const itemIds = data.itemids || data.itemIds || data.item_ids;

      if (!periodStart || !periodEnd) {
        throw new RpcException({
          code: 3,
          message: 'periodstart and periodend are required',
        });
      }

      const calculateDto: CalculateStockImpactDto = {
        period_start: periodStart,
        period_end: periodEnd,
        item_ids: itemIds,
      };

      const stockImpacts = await this.stockImpactsService.calculate(calculateDto);
      return {
        stockImpacts: stockImpacts.map(impact => this.mapStockImpactToProto(impact)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to calculate stock impacts',
      });
    }
  }

  private mapStockImpactToProto(impact: any): any {
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
      id: impact.id,
      organizationId: impact.organizationId || '',
      transactionDate: formatDate(impact.transactionDate),
      transactionType: impact.transactionType,
      itemId: impact.itemId || '',
      itemCode: impact.itemCode || '',
      itemName: impact.itemName || '',
      quantity: impact.quantity?.toString() || '0',
      unitCost: impact.unitCost?.toString() || '0',
      totalCost: impact.totalCost?.toString() || '0',
      inventoryAccountId: impact.inventoryAccountId || '',
      cogsAccountId: impact.cogsAccountId || '',
      expenseAccountId: impact.expenseAccountId || '',
      referenceId: impact.referenceId || '',
      referenceType: impact.referenceType || '',
    };
  }
}

