import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetDisposal, DisposalMethod, DisposalStatus } from './entities/asset-disposal.entity';
import { Asset, AssetStatus } from '../assets/entities/asset.entity';
import { CreateAssetDisposalDto } from './dto/create-asset-disposal.dto';
import { UpdateAssetDisposalDto } from './dto/update-asset-disposal.dto';
import { AssetDisposalPaginationDto } from './dto/pagination.dto';
import { DisposeAssetDto } from './dto/dispose-asset.dto';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { Account } from '../accounts/entities/account.entity';
import { AccountType } from '../accounts/entities/account.entity';

@Injectable()
export class AssetDisposalsService {
  constructor(
    @InjectRepository(AssetDisposal)
    private readonly assetDisposalRepository: Repository<AssetDisposal>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateAssetDisposalDto): Promise<AssetDisposal> {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id: createDto.asset_id },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${createDto.asset_id} not found`);
      }

      // Verify account exists
      const account = await this.accountRepository.findOne({
        where: { id: createDto.account_id },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${createDto.account_id} not found`);
      }

      const netBookValue = parseFloat(asset.netBookValue.toString());
      const disposalAmount = createDto.disposal_amount || 0;
      const gainLoss = disposalAmount - netBookValue;

      const disposal = this.assetDisposalRepository.create({
        organizationId: createDto.organization_id || asset.organizationId,
        assetId: createDto.asset_id,
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        disposalDate: new Date(createDto.disposal_date),
        disposalMethod: createDto.disposal_method,
        disposalAmount: disposalAmount,
        netBookValue: netBookValue,
        gainLoss: gainLoss,
        reason: createDto.reason,
        status: DisposalStatus.DRAFT,
        accountId: createDto.account_id,
      });

      return await this.assetDisposalRepository.save(disposal);
    } catch (error) {
      console.error('Error in AssetDisposalsService.create:', error);
      throw error;
    }
  }

  async dispose(assetId: string, disposeDto: DisposeAssetDto): Promise<AssetDisposal> {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      if (asset.status === AssetStatus.DISPOSED) {
        throw new BadRequestException('Asset is already disposed');
      }

      // Verify account exists
      const account = await this.accountRepository.findOne({
        where: { id: disposeDto.account_id },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${disposeDto.account_id} not found`);
      }

      const netBookValue = parseFloat(asset.netBookValue.toString());
      const disposalAmount = disposeDto.disposal_amount || 0;
      const gainLoss = disposalAmount - netBookValue;

      const disposal = this.assetDisposalRepository.create({
        organizationId: asset.organizationId,
        assetId: assetId,
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        disposalDate: new Date(disposeDto.disposal_date),
        disposalMethod: disposeDto.disposal_method,
        disposalAmount: disposalAmount,
        netBookValue: netBookValue,
        gainLoss: gainLoss,
        reason: disposeDto.reason,
        status: DisposalStatus.DRAFT,
        accountId: disposeDto.account_id,
      });

      return await this.assetDisposalRepository.save(disposal);
    } catch (error) {
      console.error('Error in AssetDisposalsService.dispose:', error);
      throw error;
    }
  }

  async findAll(query: AssetDisposalPaginationDto): Promise<AssetDisposal[]> {
    try {
      const queryBuilder = this.assetDisposalRepository.createQueryBuilder('disposal');

      if (query.asset_id) {
        queryBuilder.andWhere('disposal.assetId = :assetId', {
          assetId: query.asset_id,
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
        const validSortFields = ['disposalDate', 'disposalAmount', 'netBookValue', 'gainLoss', 'status', 'createdDate', 'updatedAt'];
        if (!validSortFields.includes(sortField)) {
          sortField = 'disposalDate';
        }
        const sortOrder = query.sort.split(':')[1]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        queryBuilder.orderBy(`disposal.${sortField}`, sortOrder);
      } else {
        queryBuilder.orderBy('disposal.disposalDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in AssetDisposalsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<AssetDisposal> {
    try {
      const disposal = await this.assetDisposalRepository.findOne({
        where: { id },
        relations: ['asset'],
      });

      if (!disposal) {
        throw new NotFoundException(`Asset Disposal with ID ${id} not found`);
      }

      return disposal;
    } catch (error) {
      console.error('Error in AssetDisposalsService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateAssetDisposalDto): Promise<AssetDisposal> {
    try {
      const disposal = await this.findOne(id);

      // Recalculate gain/loss if disposal_amount changed
      if (updateDto.disposal_amount !== undefined) {
        const disposalAmount = updateDto.disposal_amount;
        const gainLoss = disposalAmount - disposal.netBookValue;
        updateDto.gain_loss = gainLoss;
      }

      Object.assign(disposal, {
        ...(updateDto.disposal_date && { disposalDate: new Date(updateDto.disposal_date) }),
        ...(updateDto.disposal_method && { disposalMethod: updateDto.disposal_method }),
        ...(updateDto.disposal_amount !== undefined && { disposalAmount: updateDto.disposal_amount }),
        ...(updateDto.gain_loss !== undefined && { gainLoss: updateDto.gain_loss }),
        ...(updateDto.reason !== undefined && { reason: updateDto.reason }),
        ...(updateDto.status && { status: updateDto.status }),
        ...(updateDto.account_id && { accountId: updateDto.account_id }),
      });

      return await this.assetDisposalRepository.save(disposal);
    } catch (error) {
      console.error('Error in AssetDisposalsService.update:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const disposal = await this.findOne(id);
      await this.assetDisposalRepository.remove(disposal);
    } catch (error) {
      console.error('Error in AssetDisposalsService.remove:', error);
      throw error;
    }
  }

  async post(id: string): Promise<{ success: boolean; journal_entry_id: string }> {
    try {
      const disposal = await this.findOne(id);

      if (disposal.status === DisposalStatus.POSTED) {
        throw new BadRequestException('Asset Disposal is already posted');
      }

      const asset = await this.assetRepository.findOne({
        where: { id: disposal.assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${disposal.assetId} not found`);
      }

      // Get accounts
      const assetAccount = await this.accountRepository.findOne({
        where: { id: asset.accountId },
      });

      if (!assetAccount) {
        throw new NotFoundException(`Asset account with ID ${asset.accountId} not found`);
      }

      if (!disposal.accountId) {
        throw new BadRequestException('Disposal account ID is missing');
      }

      const disposalAccount = await this.accountRepository.findOne({
        where: { id: disposal.accountId },
      });

      if (!disposalAccount) {
        throw new NotFoundException(`Disposal account with ID ${disposal.accountId} not found`);
      }

      // Find accumulated depreciation account or use asset account
      const accumulatedDepreciationAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.ASSET,
          accountSubtype: 'Accumulated Depreciation',
        },
      });

      // Create journal entry lines
      const lines: any[] = [];

      // Remove asset from books (Credit Asset Account)
      lines.push({
        account_id: assetAccount.id,
        description: `Asset Disposal - ${asset.assetName}`,
        debit: 0,
        credit: parseFloat(asset.purchasePrice.toString()),
      });

      // Remove accumulated depreciation (Debit Accumulated Depreciation)
      if (accumulatedDepreciationAccount) {
        lines.push({
          account_id: accumulatedDepreciationAccount.id,
          description: `Accumulated Depreciation - ${asset.assetName}`,
          debit: parseFloat(asset.accumulatedDepreciation.toString()),
          credit: 0,
        });
      } else {
        // If no accumulated depreciation account, debit the asset account
        lines[0].debit = parseFloat(asset.accumulatedDepreciation.toString());
      }

      // Record disposal proceeds (Debit Disposal Account)
      if (disposal.disposalAmount > 0) {
        lines.push({
          account_id: disposalAccount.id,
          description: `Disposal Proceeds - ${asset.assetName}`,
          debit: disposal.disposalAmount,
          credit: 0,
        });
      }

      // Record gain or loss
      if (disposal.gainLoss > 0) {
        // Gain: Credit Gain on Disposal account
        const gainAccount = await this.accountRepository.findOne({
          where: {
            accountType: AccountType.REVENUE,
            accountSubtype: 'Gain on Disposal',
          },
        });

        if (gainAccount) {
          lines.push({
            account_id: gainAccount.id,
            description: `Gain on Disposal - ${asset.assetName}`,
            debit: 0,
            credit: disposal.gainLoss,
          });
        } else {
          // If no gain account, credit disposal account
          lines[lines.length - 1].credit = (lines[lines.length - 1].credit || 0) + disposal.gainLoss;
        }
      } else if (disposal.gainLoss < 0) {
        // Loss: Debit Loss on Disposal account
        const lossAccount = await this.accountRepository.findOne({
          where: {
            accountType: AccountType.EXPENSE,
            accountSubtype: 'Loss on Disposal',
          },
        });

        if (lossAccount) {
          lines.push({
            account_id: lossAccount.id,
            description: `Loss on Disposal - ${asset.assetName}`,
            debit: Math.abs(disposal.gainLoss),
            credit: 0,
          });
        } else {
          // If no loss account, debit disposal account
          if (disposal.disposalAmount > 0) {
            lines[lines.length - 1].debit = (lines[lines.length - 1].debit || 0) + Math.abs(disposal.gainLoss);
          } else {
            lines.push({
              account_id: disposalAccount.id,
              description: `Loss on Disposal - ${asset.assetName}`,
              debit: Math.abs(disposal.gainLoss),
              credit: 0,
            });
          }
        }
      }

      // Create journal entry
      const journalEntry = await this.journalEntriesService.create({
        organization_id: disposal.organizationId || undefined,
        entry_number: `DISPOSAL-${disposal.id.substring(0, 8)}`,
        entry_date: disposal.disposalDate.toISOString().split('T')[0],
        entry_type: 'adjustment' as any,
        description: `Asset Disposal - ${asset.assetName} (${disposal.disposalMethod})`,
        reference: `DISPOSAL-${disposal.id.substring(0, 8)}`,
        lines: lines,
      });

      // Post the journal entry
      await this.journalEntriesService.post(journalEntry.id);

      // Update disposal
      disposal.status = DisposalStatus.POSTED;
      disposal.journalEntryId = journalEntry.id;
      await this.assetDisposalRepository.save(disposal);

      // Update asset status to DISPOSED
      asset.status = AssetStatus.DISPOSED;
      asset.currentValue = 0;
      asset.netBookValue = 0;
      await this.assetRepository.save(asset);

      return {
        success: true,
        journal_entry_id: journalEntry.id,
      };
    } catch (error) {
      console.error('Error in AssetDisposalsService.post:', error);
      throw error;
    }
  }
}

