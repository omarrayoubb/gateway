import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetPaginationDto } from './dto/pagination.dto';

@Controller()
export class AssetsGrpcController {
  constructor(private readonly assetsService: AssetsService) {}

  @GrpcMethod('AssetsService', 'GetAssets')
  async getAssets(data: { sort?: string; status?: string; asset_type?: string }) {
    try {
      const query: AssetPaginationDto = {
        sort: data.sort,
        status: data.status as any,
        asset_type: data.asset_type as any,
      };

      const assets = await this.assetsService.findAll(query);
      return {
        assets: assets.map(asset => this.mapAssetToProto(asset)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get assets',
      });
    }
  }

  @GrpcMethod('AssetsService', 'GetAsset')
  async getAsset(data: { id: string }) {
    try {
      const asset = await this.assetsService.findOne(data.id);
      return this.mapAssetToProto(asset);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get asset',
      });
    }
  }

  @GrpcMethod('AssetsService', 'CreateAsset')
  async createAsset(data: any) {
    try {
      const createDto: CreateAssetDto = {
        organization_id: data.organizationId || data.organization_id,
        asset_code: data.assetCode || data.asset_code,
        asset_name: data.assetName || data.asset_name,
        asset_type: data.assetType || data.asset_type,
        purchase_date: data.purchaseDate || data.purchase_date,
        purchase_price: data.purchasePrice !== undefined ? parseFloat(data.purchasePrice.toString()) : data.purchase_price,
        depreciation_method: data.depreciationMethod || data.depreciation_method,
        useful_life_years: data.usefulLifeYears !== undefined ? parseInt(data.usefulLifeYears.toString()) : data.useful_life_years,
        salvage_value: data.salvageValue !== undefined ? parseFloat(data.salvageValue.toString()) : data.salvage_value,
        location: data.location,
        account_id: data.accountId || data.account_id,
      };

      const asset = await this.assetsService.create(createDto);
      return this.mapAssetToProto(asset);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create asset',
      });
    }
  }

  @GrpcMethod('AssetsService', 'UpdateAsset')
  async updateAsset(data: any) {
    try {
      const updateDto: UpdateAssetDto = {
        asset_code: data.assetCode || data.asset_code,
        asset_name: data.assetName || data.asset_name,
        asset_type: data.assetType || data.asset_type,
        purchase_date: data.purchaseDate || data.purchase_date,
        purchase_price: data.purchasePrice !== undefined ? parseFloat(data.purchasePrice.toString()) : data.purchase_price,
        current_value: data.currentValue !== undefined ? parseFloat(data.currentValue.toString()) : data.current_value,
        accumulated_depreciation: data.accumulatedDepreciation !== undefined ? parseFloat(data.accumulatedDepreciation.toString()) : data.accumulated_depreciation,
        net_book_value: data.netBookValue !== undefined ? parseFloat(data.netBookValue.toString()) : data.net_book_value,
        depreciation_method: data.depreciationMethod || data.depreciation_method,
        useful_life_years: data.usefulLifeYears !== undefined ? parseInt(data.usefulLifeYears.toString()) : data.useful_life_years,
        salvage_value: data.salvageValue !== undefined ? parseFloat(data.salvageValue.toString()) : data.salvage_value,
        status: data.status,
        location: data.location,
        account_id: data.accountId || data.account_id,
      };

      const asset = await this.assetsService.update(data.id, updateDto);
      return this.mapAssetToProto(asset);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update asset',
      });
    }
  }

  @GrpcMethod('AssetsService', 'DeleteAsset')
  async deleteAsset(data: { id: string }) {
    try {
      await this.assetsService.remove(data.id);
      return { success: true, message: 'Asset deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete asset',
      });
    }
  }

  private mapAssetToProto(asset: any): any {
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
      id: asset.id,
      organizationId: asset.organizationId || '',
      assetCode: asset.assetCode || '',
      assetName: asset.assetName || '',
      assetType: asset.assetType,
      purchaseDate: formatDate(asset.purchaseDate),
      purchasePrice: asset.purchasePrice?.toString() || '0',
      currentValue: asset.currentValue?.toString() || '0',
      accumulatedDepreciation: asset.accumulatedDepreciation?.toString() || '0',
      netBookValue: asset.netBookValue?.toString() || '0',
      depreciationMethod: asset.depreciationMethod,
      usefulLifeYears: asset.usefulLifeYears?.toString() || '0',
      salvageValue: asset.salvageValue?.toString() || '0',
      status: asset.status,
      location: asset.location || '',
      accountId: asset.accountId || '',
    };
  }
}

