import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CogsService } from './cogs.service';
import { CreateCogsDto } from './dto/create-cogs.dto';
import { UpdateCogsDto } from './dto/update-cogs.dto';
import { CogsPaginationDto } from './dto/pagination.dto';
import { CalculateCogsDto } from './dto/calculate-cogs.dto';

@Controller()
export class CogsGrpcController {
  constructor(private readonly cogsService: CogsService) {}

  @GrpcMethod('CogsService', 'GetCogs')
  async getCogs(data: { period_start?: string; period_end?: string }) {
    try {
      const cogs = await this.cogsService.findAll({
        period_start: data.period_start,
        period_end: data.period_end,
      });

      return {
        cogs: cogs.map(c => this.mapCogsToProto(c)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to fetch COGS',
      });
    }
  }

  @GrpcMethod('CogsService', 'GetCogsRecord')
  async getCogsRecord(data: { id: string }) {
    try {
      const cogs = await this.cogsService.findOne(data.id);
      return this.mapCogsToProto(cogs);
    } catch (error) {
      if (error.status === 404) {
        throw new RpcException({
          code: 5,
          message: error.message || 'COGS record not found',
        });
      }
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to fetch COGS record',
      });
    }
  }

  @GrpcMethod('CogsService', 'CreateCogs')
  async createCogs(data: any) {
    try {
      const createDto: CreateCogsDto = {
        organization_id: data.organization_id || data.organizationId,
        period_start: data.period_start || data.periodStart,
        period_end: data.period_end || data.periodEnd,
        item_id: data.item_id || data.itemId,
        quantity_sold: parseFloat(data.quantity_sold || data.quantitySold || '0'),
        unit_cost: parseFloat(data.unit_cost || data.unitCost || '0'),
      };

      const cogs = await this.cogsService.create(createDto);
      return this.mapCogsToProto(cogs);
    } catch (error) {
      throw new RpcException({
        code: 3,
        message: error.message || 'Failed to create COGS record',
      });
    }
  }

  @GrpcMethod('CogsService', 'UpdateCogs')
  async updateCogs(data: any) {
    try {
      const updateDto: UpdateCogsDto = {
        organization_id: data.organization_id || data.organizationId,
        period_start: data.period_start || data.periodStart,
        period_end: data.period_end || data.periodEnd,
        item_id: data.item_id || data.itemId,
        quantity_sold: data.quantity_sold !== undefined ? parseFloat(data.quantity_sold.toString()) : undefined,
        unit_cost: data.unit_cost !== undefined ? parseFloat(data.unit_cost.toString()) : undefined,
      };

      const cogs = await this.cogsService.update(data.id, updateDto);
      return this.mapCogsToProto(cogs);
    } catch (error) {
      if (error.status === 404) {
        throw new RpcException({
          code: 5,
          message: error.message || 'COGS record not found',
        });
      }
      throw new RpcException({
        code: 3,
        message: error.message || 'Failed to update COGS record',
      });
    }
  }

  @GrpcMethod('CogsService', 'DeleteCogs')
  async deleteCogs(data: { id: string }) {
    try {
      await this.cogsService.remove(data.id);
      return { success: true };
    } catch (error) {
      if (error.status === 404) {
        throw new RpcException({
          code: 5,
          message: error.message || 'COGS record not found',
        });
      }
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete COGS record',
      });
    }
  }

  @GrpcMethod('CogsService', 'CalculateCogs')
  async calculateCogs(data: any) {
    try {
      console.log('CalculateCogs received data:', JSON.stringify(data));
      
      // Support both snake_case and camelCase
      const periodStart = data.period_start || data.periodStart || '';
      const periodEnd = data.period_end || data.periodEnd || '';
      const itemIds = data.item_ids || data.itemIds;

      console.log('CalculateCogs parsed:', { periodStart, periodEnd, itemIds });

      if (!periodStart || !periodEnd) {
        console.error('CalculateCogs validation failed:', { periodStart, periodEnd, data });
        throw new RpcException({
          code: 3,
          message: 'period_start and period_end are required',
        });
      }

      const calculateDto: CalculateCogsDto = {
        period_start: periodStart,
        period_end: periodEnd,
        item_ids: itemIds,
      };

      const result = await this.cogsService.calculate(calculateDto);
      return {
        period_start: result.period_start,
        period_end: result.period_end,
        total_cogs: result.total_cogs.toString(),
        items: result.items.map(item => ({
          item_id: item.item_id,
          item_code: item.item_code || '',
          item_name: item.item_name || '',
          quantity_sold: item.quantity_sold.toString(),
          unit_cost: item.unit_cost.toString(),
          total_cogs: item.total_cogs.toString(),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: 3,
        message: error.message || 'Failed to calculate COGS',
      });
    }
  }

  @GrpcMethod('CogsService', 'GetCogsReport')
  async getCogsReport(data: any) {
    try {
      console.log('GetCogsReport received data:', JSON.stringify(data));
      
      // Proto field names are: periodstart, periodend (all lowercase, no underscores)
      // Support both proto format and camelCase for compatibility
      const periodStart = data?.periodstart || data?.periodStart || data?.period_start || '';
      const periodEnd = data?.periodend || data?.periodEnd || data?.period_end || '';

      console.log('GetCogsReport parsed:', { periodStart, periodEnd });

      if (!periodStart || !periodEnd) {
        console.error('GetCogsReport validation failed:', { periodStart, periodEnd, data, dataKeys: data ? Object.keys(data) : [] });
        throw new RpcException({
          code: 3,
          message: 'periodstart and periodend are required',
        });
      }

      const result = await this.cogsService.getReport(periodStart, periodEnd);
      return {
        periodstart: result.period_start,
        periodend: result.period_end,
        summary: {
          totalcogs: result.summary.total_cogs.toString(),
          totalrevenue: result.summary.total_revenue.toString(),
          grossprofit: result.summary.gross_profit.toString(),
          grossprofitmargin: result.summary.gross_profit_margin.toString(),
        },
        items: result.items.map(item => ({
          itemid: item.item_id || '',
          itemcode: item.item_code || '',
          itemname: item.item_name || '',
          quantitysold: item.quantity_sold?.toString() || '0',
          unitcost: item.unit_cost?.toString() || '0',
          totalcogs: item.total_cogs?.toString() || '0',
          revenue: item.revenue?.toString() || '0',
          profit: item.profit?.toString() || '0',
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get COGS report',
      });
    }
  }

  private mapCogsToProto(cogs: any): any {
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
      id: cogs.id,
      organizationId: cogs.organizationId || '',
      periodStart: formatDate(cogs.periodStart),
      periodEnd: formatDate(cogs.periodEnd),
      itemId: cogs.itemId || '',
      itemCode: cogs.itemCode || '',
      itemName: cogs.itemName || '',
      quantitySold: cogs.quantitySold ? cogs.quantitySold.toString() : '0',
      unitCost: cogs.unitCost ? cogs.unitCost.toString() : '0',
      totalCogs: cogs.totalCogs ? cogs.totalCogs.toString() : '0',
      currency: cogs.currency || 'USD',
    };
  }
}

