import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Asset, AssetStatus } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { Account } from '../accounts/entities/account.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createDto: CreateAssetDto): Promise<Asset> {
    try {
      const organizationId = createDto.organization_id || null;

      // Verify account exists
      const account = await this.accountRepository.findOne({
        where: { id: createDto.account_id },
      });

      if (!account) {
        throw new BadRequestException(`Account with ID ${createDto.account_id} not found`);
      }

      // Calculate initial values
      const purchasePrice = createDto.purchase_price || 0;
      const salvageValue = createDto.salvage_value || 0;
      const currentValue = purchasePrice;
      const accumulatedDepreciation = 0;
      const netBookValue = purchasePrice - accumulatedDepreciation;

      const asset = this.assetRepository.create({
        organizationId: organizationId,
        assetCode: createDto.asset_code,
        assetName: createDto.asset_name,
        assetType: createDto.asset_type,
        purchaseDate: new Date(createDto.purchase_date),
        purchasePrice: purchasePrice,
        currentValue: currentValue,
        accumulatedDepreciation: accumulatedDepreciation,
        netBookValue: netBookValue,
        depreciationMethod: createDto.depreciation_method,
        usefulLifeYears: createDto.useful_life_years || 0,
        salvageValue: salvageValue,
        status: AssetStatus.ACTIVE,
        location: createDto.location || null,
        accountId: createDto.account_id,
      });

      return await this.assetRepository.save(asset);
    } catch (error) {
      console.error('Error in AssetsService.create:', error);
      throw error;
    }
  }

  async findAll(query: AssetPaginationDto): Promise<Asset[]> {
    try {
      const queryBuilder = this.assetRepository.createQueryBuilder('asset');

      if (query.status) {
        queryBuilder.andWhere('asset.status = :status', {
          status: query.status,
        });
      }

      if (query.asset_type) {
        queryBuilder.andWhere('asset.assetType = :assetType', {
          assetType: query.asset_type,
        });
      }

      if (query.sort) {
        // Map snake_case to camelCase for database field names
        let sortField = query.sort.split(':')[0];
        if (sortField.includes('_')) {
          sortField = sortField.split('_').map((part, index) => 
            index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
          ).join('');
        }
        // Validate sort field
        const validSortFields = ['assetName', 'assetCode', 'purchaseDate', 'purchasePrice', 'currentValue', 'netBookValue', 'status', 'createdDate', 'updatedAt'];
        if (!validSortFields.includes(sortField)) {
          sortField = 'purchaseDate';
        }
        const sortOrder = query.sort.split(':')[1]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        queryBuilder.orderBy(`asset.${sortField}`, sortOrder);
      } else {
        queryBuilder.orderBy('asset.purchaseDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in AssetsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Asset> {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${id} not found`);
      }

      return asset;
    } catch (error) {
      console.error('Error in AssetsService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateAssetDto): Promise<Asset> {
    try {
      const asset = await this.findOne(id);

      // Recalculate values if purchase price or depreciation changed
      if (updateDto.purchase_price !== undefined || updateDto.accumulated_depreciation !== undefined) {
        const purchasePrice = updateDto.purchase_price ?? asset.purchasePrice;
        const accumulatedDepreciation = updateDto.accumulated_depreciation ?? asset.accumulatedDepreciation;
        const netBookValue = purchasePrice - accumulatedDepreciation;
        updateDto.net_book_value = netBookValue;
        updateDto.current_value = netBookValue;
      }

      Object.assign(asset, {
        ...(updateDto.asset_code && { assetCode: updateDto.asset_code }),
        ...(updateDto.asset_name && { assetName: updateDto.asset_name }),
        ...(updateDto.asset_type && { assetType: updateDto.asset_type }),
        ...(updateDto.purchase_date && { purchaseDate: new Date(updateDto.purchase_date) }),
        ...(updateDto.purchase_price !== undefined && { purchasePrice: updateDto.purchase_price }),
        ...(updateDto.current_value !== undefined && { currentValue: updateDto.current_value }),
        ...(updateDto.accumulated_depreciation !== undefined && { accumulatedDepreciation: updateDto.accumulated_depreciation }),
        ...(updateDto.net_book_value !== undefined && { netBookValue: updateDto.net_book_value }),
        ...(updateDto.depreciation_method && { depreciationMethod: updateDto.depreciation_method }),
        ...(updateDto.useful_life_years !== undefined && { usefulLifeYears: updateDto.useful_life_years }),
        ...(updateDto.salvage_value !== undefined && { salvageValue: updateDto.salvage_value }),
        ...(updateDto.status && { status: updateDto.status }),
        ...(updateDto.location !== undefined && { location: updateDto.location }),
        ...(updateDto.account_id && { accountId: updateDto.account_id }),
      });

      return await this.assetRepository.save(asset);
    } catch (error) {
      console.error('Error in AssetsService.update:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const asset = await this.findOne(id);
      await this.assetRepository.remove(asset);
    } catch (error) {
      console.error('Error in AssetsService.remove:', error);
      throw error;
    }
  }
}

