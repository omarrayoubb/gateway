import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AssetRevaluationsService } from './asset-revaluations.service';
import { CreateAssetRevaluationDto } from './dto/create-asset-revaluation.dto';
import { UpdateAssetRevaluationDto } from './dto/update-asset-revaluation.dto';
import { AssetRevaluationPaginationDto } from './dto/pagination.dto';

@Controller()
export class AssetRevaluationsGrpcController {
  constructor(private readonly assetRevaluationsService: AssetRevaluationsService) {}

  @GrpcMethod('AssetRevaluationsService', 'GetAssetRevaluations')
  async getAssetRevaluations(data: { assetId?: string; sort?: string }) {
    try {
      const query: AssetRevaluationPaginationDto = {
        asset_id: data.assetId,
        sort: data.sort,
      };

      const revaluations = await this.assetRevaluationsService.findAll(query);
      return {
        assetRevaluations: revaluations.map(reval => this.mapRevaluationToProto(reval)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get asset revaluations',
      });
    }
  }

  @GrpcMethod('AssetRevaluationsService', 'GetAssetRevaluation')
  async getAssetRevaluation(data: { id: string }) {
    try {
      const revaluation = await this.assetRevaluationsService.findOne(data.id);
      return this.mapRevaluationToProto(revaluation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get asset revaluation',
      });
    }
  }

  @GrpcMethod('AssetRevaluationsService', 'CreateAssetRevaluation')
  async createAssetRevaluation(data: any) {
    try {
      const createDto: CreateAssetRevaluationDto = {
        organization_id: data.organizationId || data.organization_id,
        asset_id: data.assetId || data.asset_id,
        revaluation_date: data.revaluationDate || data.revaluation_date,
        new_value: data.newValue !== undefined ? parseFloat(data.newValue.toString()) : data.new_value,
        reason: data.reason,
        account_id: data.accountId || data.account_id,
      };

      const revaluation = await this.assetRevaluationsService.create(createDto);
      return this.mapRevaluationToProto(revaluation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create asset revaluation',
      });
    }
  }

  @GrpcMethod('AssetRevaluationsService', 'UpdateAssetRevaluation')
  async updateAssetRevaluation(data: any) {
    try {
      const updateDto: UpdateAssetRevaluationDto = {
        revaluation_date: data.revaluationDate || data.revaluation_date,
        new_value: data.newValue !== undefined ? parseFloat(data.newValue.toString()) : data.new_value,
        reason: data.reason,
        ...(data.status && { status: data.status }),
        account_id: data.accountId || data.account_id,
      };

      const revaluation = await this.assetRevaluationsService.update(data.id, updateDto);
      return this.mapRevaluationToProto(revaluation);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update asset revaluation',
      });
    }
  }

  @GrpcMethod('AssetRevaluationsService', 'DeleteAssetRevaluation')
  async deleteAssetRevaluation(data: { id: string }) {
    try {
      await this.assetRevaluationsService.remove(data.id);
      return { success: true, message: 'Asset Revaluation deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete asset revaluation',
      });
    }
  }

  @GrpcMethod('AssetRevaluationsService', 'PostAssetRevaluation')
  async postAssetRevaluation(data: { id: string }) {
    try {
      const result = await this.assetRevaluationsService.post(data.id);
      return {
        success: result.success,
        journalEntryId: result.journal_entry_id,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to post asset revaluation',
      });
    }
  }

  private mapRevaluationToProto(revaluation: any): any {
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
      id: revaluation.id,
      organizationId: revaluation.organizationId || '',
      assetId: revaluation.assetId || '',
      assetCode: revaluation.assetCode || '',
      assetName: revaluation.assetName || '',
      revaluationDate: formatDate(revaluation.revaluationDate),
      previousValue: revaluation.previousValue?.toString() || '0',
      newValue: revaluation.newValue?.toString() || '0',
      revaluationAmount: revaluation.revaluationAmount?.toString() || '0',
      revaluationType: revaluation.revaluationType,
      reason: revaluation.reason || '',
      status: revaluation.status || 'draft',
      accountId: revaluation.accountId || '',
      journalEntryId: revaluation.journalEntryId || '',
    };
  }
}

