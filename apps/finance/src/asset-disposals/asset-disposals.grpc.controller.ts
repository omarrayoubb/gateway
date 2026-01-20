import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AssetDisposalsService } from './asset-disposals.service';
import { CreateAssetDisposalDto } from './dto/create-asset-disposal.dto';
import { UpdateAssetDisposalDto } from './dto/update-asset-disposal.dto';
import { AssetDisposalPaginationDto } from './dto/pagination.dto';
import { DisposeAssetDto } from './dto/dispose-asset.dto';

@Controller()
export class AssetDisposalsGrpcController {
  constructor(private readonly assetDisposalsService: AssetDisposalsService) {}

  @GrpcMethod('AssetDisposalsService', 'GetAssetDisposals')
  async getAssetDisposals(data: { assetId?: string; sort?: string }) {
    try {
      const query: AssetDisposalPaginationDto = {
        asset_id: data.assetId,
        sort: data.sort,
      };

      const disposals = await this.assetDisposalsService.findAll(query);
      return {
        assetDisposals: disposals.map(disposal => this.mapDisposalToProto(disposal)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get asset disposals',
      });
    }
  }

  @GrpcMethod('AssetDisposalsService', 'GetAssetDisposal')
  async getAssetDisposal(data: { id: string }) {
    try {
      const disposal = await this.assetDisposalsService.findOne(data.id);
      return this.mapDisposalToProto(disposal);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get asset disposal',
      });
    }
  }

  @GrpcMethod('AssetDisposalsService', 'CreateAssetDisposal')
  async createAssetDisposal(data: any) {
    try {
      const createDto: CreateAssetDisposalDto = {
        organization_id: data.organizationId || data.organization_id,
        asset_id: data.assetId || data.asset_id,
        disposal_date: data.disposalDate || data.disposal_date,
        disposal_method: data.disposalMethod || data.disposal_method,
        disposal_amount: data.disposalAmount !== undefined ? parseFloat(data.disposalAmount.toString()) : data.disposal_amount,
        reason: data.reason,
        account_id: data.accountId || data.account_id,
      };

      const disposal = await this.assetDisposalsService.create(createDto);
      return this.mapDisposalToProto(disposal);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create asset disposal',
      });
    }
  }

  @GrpcMethod('AssetDisposalsService', 'DisposeAsset')
  async disposeAsset(data: { assetId: string; disposalDate: string; disposalMethod: string; disposalAmount?: string; reason: string; accountId: string }) {
    try {
      const disposeDto: DisposeAssetDto = {
        disposal_date: data.disposalDate,
        disposal_method: data.disposalMethod as any,
        disposal_amount: data.disposalAmount !== undefined ? parseFloat(data.disposalAmount.toString()) : undefined,
        reason: data.reason,
        account_id: data.accountId,
      };

      const disposal = await this.assetDisposalsService.dispose(data.assetId, disposeDto);
      return this.mapDisposalToProto(disposal);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to dispose asset',
      });
    }
  }

  @GrpcMethod('AssetDisposalsService', 'UpdateAssetDisposal')
  async updateAssetDisposal(data: any) {
    try {
      const updateDto: UpdateAssetDisposalDto = {
        disposal_date: data.disposalDate,
        disposal_method: data.disposalMethod,
        disposal_amount: data.disposalAmount !== undefined ? parseFloat(data.disposalAmount.toString()) : undefined,
        gain_loss: data.gainLoss !== undefined ? parseFloat(data.gainLoss.toString()) : undefined,
        reason: data.reason,
        status: data.status,
        account_id: data.accountId,
      };

      const disposal = await this.assetDisposalsService.update(data.id, updateDto);
      return this.mapDisposalToProto(disposal);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update asset disposal',
      });
    }
  }

  @GrpcMethod('AssetDisposalsService', 'DeleteAssetDisposal')
  async deleteAssetDisposal(data: { id: string }) {
    try {
      await this.assetDisposalsService.remove(data.id);
      return { success: true, message: 'Asset Disposal deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete asset disposal',
      });
    }
  }

  @GrpcMethod('AssetDisposalsService', 'PostAssetDisposal')
  async postAssetDisposal(data: { id: string }) {
    try {
      const result = await this.assetDisposalsService.post(data.id);
      return {
        success: result.success,
        journalEntryId: result.journal_entry_id,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to post asset disposal',
      });
    }
  }

  private mapDisposalToProto(disposal: any): any {
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
      id: disposal.id,
      organizationId: disposal.organizationId || '',
      assetId: disposal.assetId || '',
      assetCode: disposal.assetCode || '',
      assetName: disposal.assetName || '',
      disposalDate: formatDate(disposal.disposalDate),
      disposalMethod: disposal.disposalMethod,
      disposalAmount: disposal.disposalAmount?.toString() || '0',
      netBookValue: disposal.netBookValue?.toString() || '0',
      gainLoss: disposal.gainLoss?.toString() || '0',
      reason: disposal.reason || '',
      status: disposal.status || 'draft',
      accountId: disposal.accountId || '',
      journalEntryId: disposal.journalEntryId || '',
    };
  }
}

