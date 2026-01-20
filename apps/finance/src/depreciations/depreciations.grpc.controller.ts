import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { DepreciationsService } from './depreciations.service';
import { CreateDepreciationDto } from './dto/create-depreciation.dto';
import { UpdateDepreciationDto } from './dto/update-depreciation.dto';
import { DepreciationPaginationDto } from './dto/pagination.dto';
import { CalculateDepreciationDto } from './dto/calculate-depreciation.dto';

@Controller()
export class DepreciationsGrpcController {
  constructor(private readonly depreciationsService: DepreciationsService) {}

  @GrpcMethod('DepreciationsService', 'GetDepreciations')
  async getDepreciations(data: { assetId?: string; periodStart?: string; periodEnd?: string }) {
    try {
      const query: DepreciationPaginationDto = {
        asset_id: data.assetId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
      };

      const depreciations = await this.depreciationsService.findAll(query);
      return {
        depreciations: depreciations.map(dep => this.mapDepreciationToProto(dep)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get depreciations',
      });
    }
  }

  @GrpcMethod('DepreciationsService', 'GetDepreciation')
  async getDepreciation(data: { id: string }) {
    try {
      const depreciation = await this.depreciationsService.findOne(data.id);
      return this.mapDepreciationToProto(depreciation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get depreciation',
      });
    }
  }

  @GrpcMethod('DepreciationsService', 'CreateDepreciation')
  async createDepreciation(data: any) {
    try {
      const createDto: CreateDepreciationDto = {
        organization_id: data.organizationId || data.organization_id,
        asset_id: data.assetId || data.asset_id,
        depreciation_date: data.depreciationDate || data.depreciation_date,
        period: data.period,
        depreciation_amount: data.depreciationAmount !== undefined ? parseFloat(data.depreciationAmount.toString()) : data.depreciation_amount,
        accumulated_depreciation: data.accumulatedDepreciation !== undefined ? parseFloat(data.accumulatedDepreciation.toString()) : data.accumulated_depreciation,
        net_book_value: data.netBookValue !== undefined ? parseFloat(data.netBookValue.toString()) : data.net_book_value,
        status: data.status,
      };

      const depreciation = await this.depreciationsService.create(createDto);
      return this.mapDepreciationToProto(depreciation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create depreciation',
      });
    }
  }

  @GrpcMethod('DepreciationsService', 'UpdateDepreciation')
  async updateDepreciation(data: any) {
    try {
      const updateDto: UpdateDepreciationDto = {
        depreciation_date: data.depreciationDate || data.depreciation_date,
        period: data.period,
        depreciation_amount: data.depreciationAmount !== undefined ? parseFloat(data.depreciationAmount.toString()) : data.depreciation_amount,
        accumulated_depreciation: data.accumulatedDepreciation !== undefined ? parseFloat(data.accumulatedDepreciation.toString()) : data.accumulated_depreciation,
        net_book_value: data.netBookValue !== undefined ? parseFloat(data.netBookValue.toString()) : data.net_book_value,
        status: data.status,
      };

      const depreciation = await this.depreciationsService.update(data.id, updateDto);
      return this.mapDepreciationToProto(depreciation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update depreciation',
      });
    }
  }

  @GrpcMethod('DepreciationsService', 'DeleteDepreciation')
  async deleteDepreciation(data: { id: string }) {
    try {
      await this.depreciationsService.remove(data.id);
      return { success: true, message: 'Depreciation deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete depreciation',
      });
    }
  }

  @GrpcMethod('DepreciationsService', 'CalculateDepreciation')
  async calculateDepreciation(data: { assetId: string; periodStart: string; periodEnd: string }) {
    try {
      const calculateDto: CalculateDepreciationDto = {
        asset_id: data.assetId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
      };

      const result = await this.depreciationsService.calculate(calculateDto);
      return {
        assetId: result.asset_id,
        assetName: result.asset_name,
        periodStart: result.period_start,
        periodEnd: result.period_end,
        depreciationSchedule: result.depreciation_schedule.map((item: any) => ({
          period: item.period,
          depreciationAmount: item.depreciation_amount.toString(),
          accumulatedDepreciation: item.accumulated_depreciation.toString(),
          netBookValue: item.net_book_value.toString(),
        })),
        totalDepreciation: result.total_depreciation.toString(),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to calculate depreciation',
      });
    }
  }

  @GrpcMethod('DepreciationsService', 'GetDepreciationSchedule')
  async getDepreciationSchedule(data: { assetId: string }) {
    try {
      const result = await this.depreciationsService.getSchedule(data.assetId);
      return {
        asset: {
          id: result.asset.id,
          assetCode: result.asset.asset_code || '',
          assetName: result.asset.asset_name || '',
          purchasePrice: result.asset.purchase_price.toString(),
          currentValue: result.asset.current_value.toString(),
          accumulatedDepreciation: result.asset.accumulated_depreciation.toString(),
          netBookValue: result.asset.net_book_value.toString(),
          depreciationMethod: result.asset.depreciation_method,
          usefulLifeYears: result.asset.useful_life_years.toString(),
          salvageValue: result.asset.salvage_value.toString(),
        },
        depreciationSchedule: result.depreciation_schedule.map((item: any) => ({
          period: item.period,
          depreciationAmount: item.depreciation_amount.toString(),
          accumulatedDepreciation: item.accumulated_depreciation.toString(),
          netBookValue: item.net_book_value.toString(),
          status: item.status,
        })),
        totalDepreciation: result.total_depreciation.toString(),
        remainingLifeYears: result.remaining_life_years.toString(),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get depreciation schedule',
      });
    }
  }

  @GrpcMethod('DepreciationsService', 'PostDepreciation')
  async postDepreciation(data: { id: string }) {
    try {
      const result = await this.depreciationsService.post(data.id);
      return {
        success: result.success,
        journalEntryId: result.journal_entry_id,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to post depreciation',
      });
    }
  }

  private mapDepreciationToProto(depreciation: any): any {
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
      id: depreciation.id,
      organizationId: depreciation.organizationId || '',
      assetId: depreciation.assetId || '',
      assetCode: depreciation.assetCode || '',
      assetName: depreciation.assetName || '',
      depreciationDate: formatDate(depreciation.depreciationDate),
      period: depreciation.period || '',
      depreciationAmount: depreciation.depreciationAmount?.toString() || '0',
      accumulatedDepreciation: depreciation.accumulatedDepreciation?.toString() || '0',
      netBookValue: depreciation.netBookValue?.toString() || '0',
      status: depreciation.status || 'pending',
      journalEntryId: depreciation.journalEntryId || '',
    };
  }
}

