import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetRevaluation, RevaluationType, RevaluationStatus } from './entities/asset-revaluation.entity';
import { Asset } from '../assets/entities/asset.entity';
import { CreateAssetRevaluationDto } from './dto/create-asset-revaluation.dto';
import { UpdateAssetRevaluationDto } from './dto/update-asset-revaluation.dto';
import { AssetRevaluationPaginationDto } from './dto/pagination.dto';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { Account } from '../accounts/entities/account.entity';
import { AccountType } from '../accounts/entities/account.entity';

@Injectable()
export class AssetRevaluationsService {
  constructor(
    @InjectRepository(AssetRevaluation)
    private readonly assetRevaluationRepository: Repository<AssetRevaluation>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateAssetRevaluationDto): Promise<AssetRevaluation> {
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

      const previousValue = parseFloat(asset.currentValue.toString());
      const newValue = createDto.new_value || previousValue;
      const revaluationAmount = newValue - previousValue;
      const revaluationType = revaluationAmount >= 0 ? RevaluationType.UPWARD : RevaluationType.DOWNWARD;

      const revaluation = this.assetRevaluationRepository.create({
        organizationId: createDto.organization_id || asset.organizationId,
        assetId: createDto.asset_id,
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        revaluationDate: new Date(createDto.revaluation_date),
        previousValue: previousValue,
        newValue: newValue,
        revaluationAmount: Math.abs(revaluationAmount),
        revaluationType: revaluationType,
        reason: createDto.reason,
        status: RevaluationStatus.DRAFT,
        accountId: createDto.account_id,
      });

      return await this.assetRevaluationRepository.save(revaluation);
    } catch (error) {
      console.error('Error in AssetRevaluationsService.create:', error);
      throw error;
    }
  }

  async findAll(query: AssetRevaluationPaginationDto): Promise<AssetRevaluation[]> {
    try {
      const queryBuilder = this.assetRevaluationRepository.createQueryBuilder('revaluation');

      if (query.asset_id) {
        queryBuilder.andWhere('revaluation.assetId = :assetId', {
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
        const validSortFields = ['revaluationDate', 'previousValue', 'newValue', 'revaluationAmount', 'status', 'createdDate', 'updatedAt'];
        if (!validSortFields.includes(sortField)) {
          sortField = 'revaluationDate';
        }
        const sortOrder = query.sort.split(':')[1]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        queryBuilder.orderBy(`revaluation.${sortField}`, sortOrder);
      } else {
        queryBuilder.orderBy('revaluation.revaluationDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in AssetRevaluationsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<AssetRevaluation> {
    try {
      const revaluation = await this.assetRevaluationRepository.findOne({
        where: { id },
        relations: ['asset'],
      });

      if (!revaluation) {
        throw new NotFoundException(`Asset Revaluation with ID ${id} not found`);
      }

      return revaluation;
    } catch (error) {
      console.error('Error in AssetRevaluationsService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateAssetRevaluationDto): Promise<AssetRevaluation> {
    try {
      const revaluation = await this.findOne(id);

      // Recalculate if new_value changed
      if (updateDto.new_value !== undefined) {
        const newValue = updateDto.new_value;
        const revaluationAmount = Math.abs(newValue - revaluation.previousValue);
        const revaluationType = newValue >= revaluation.previousValue ? RevaluationType.UPWARD : RevaluationType.DOWNWARD;
        updateDto.revaluation_amount = revaluationAmount;
        updateDto.revaluation_type = revaluationType;
      }

      Object.assign(revaluation, {
        ...(updateDto.revaluation_date && { revaluationDate: new Date(updateDto.revaluation_date) }),
        ...(updateDto.new_value !== undefined && { newValue: updateDto.new_value }),
        ...(updateDto.revaluation_amount !== undefined && { revaluationAmount: updateDto.revaluation_amount }),
        ...(updateDto.revaluation_type && { revaluationType: updateDto.revaluation_type }),
        ...(updateDto.reason !== undefined && { reason: updateDto.reason }),
        ...(updateDto.status && { status: updateDto.status }),
        ...(updateDto.account_id && { accountId: updateDto.account_id }),
      });

      return await this.assetRevaluationRepository.save(revaluation);
    } catch (error) {
      console.error('Error in AssetRevaluationsService.update:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const revaluation = await this.findOne(id);
      await this.assetRevaluationRepository.remove(revaluation);
    } catch (error) {
      console.error('Error in AssetRevaluationsService.remove:', error);
      throw error;
    }
  }

  async post(id: string): Promise<{ success: boolean; journal_entry_id: string }> {
    try {
      const revaluation = await this.findOne(id);

      if (revaluation.status === RevaluationStatus.POSTED) {
        throw new BadRequestException('Asset Revaluation is already posted');
      }

      const asset = await this.assetRepository.findOne({
        where: { id: revaluation.assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${revaluation.assetId} not found`);
      }

      // Find revaluation reserve account (equity account)
      const revaluationReserveAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.EQUITY,
          accountSubtype: 'Revaluation Reserve',
        },
      });

      if (!revaluationReserveAccount) {
        throw new NotFoundException('Revaluation Reserve account not found. Please create an account with type EQUITY and subtype Revaluation Reserve.');
      }

      // Get the account specified in revaluation
      const revaluationAccount = await this.accountRepository.findOne({
        where: { id: revaluation.accountId },
      });

      if (!revaluationAccount) {
        throw new NotFoundException(`Account with ID ${revaluation.accountId} not found`);
      }

      // Get asset account
      const assetAccount = await this.accountRepository.findOne({
        where: { id: asset.accountId },
      });

      if (!assetAccount) {
        throw new NotFoundException(`Asset account with ID ${asset.accountId} not found`);
      }

      // Create journal entry
      let journalEntry;
      if (revaluation.revaluationType === RevaluationType.UPWARD) {
        // Upward revaluation: Debit Asset, Credit Revaluation Reserve
        journalEntry = await this.journalEntriesService.create({
          organization_id: revaluation.organizationId || undefined,
          entry_number: `REVAL-${revaluation.id.substring(0, 8)}`,
          entry_date: revaluation.revaluationDate.toISOString().split('T')[0],
          entry_type: 'adjustment' as any,
          description: `Asset Revaluation (Upward) - ${asset.assetName}`,
          reference: `REVAL-${revaluation.id.substring(0, 8)}`,
          lines: [
            {
              account_id: assetAccount.id,
              description: `Asset Revaluation - ${asset.assetName}`,
              debit: revaluation.revaluationAmount,
              credit: 0,
            },
            {
              account_id: revaluationReserveAccount.id,
              description: `Revaluation Reserve - ${asset.assetName}`,
              debit: 0,
              credit: revaluation.revaluationAmount,
            },
          ],
        });
      } else {
        // Downward revaluation: Debit Revaluation Reserve (if available), Debit Expense, Credit Asset
        const reserveBalance = 0; // TODO: Get actual revaluation reserve balance for this asset
        const reserveAmount = Math.min(revaluation.revaluationAmount, reserveBalance);
        const expenseAmount = revaluation.revaluationAmount - reserveAmount;

        const lines: any[] = [];

        if (reserveAmount > 0) {
          lines.push({
            account_id: revaluationReserveAccount.id,
            description: `Revaluation Reserve - ${asset.assetName}`,
            debit: reserveAmount,
            credit: 0,
          });
        }

        if (expenseAmount > 0) {
          lines.push({
            account_id: revaluationAccount.id,
            description: `Revaluation Loss - ${asset.assetName}`,
            debit: expenseAmount,
            credit: 0,
          });
        }

        lines.push({
          account_id: assetAccount.id,
          description: `Asset Revaluation - ${asset.assetName}`,
          debit: 0,
          credit: revaluation.revaluationAmount,
        });

        journalEntry = await this.journalEntriesService.create({
          organization_id: revaluation.organizationId || undefined,
          entry_number: `REVAL-${revaluation.id.substring(0, 8)}`,
          entry_date: revaluation.revaluationDate.toISOString().split('T')[0],
          entry_type: 'adjustment' as any,
          description: `Asset Revaluation (Downward) - ${asset.assetName}`,
          reference: `REVAL-${revaluation.id.substring(0, 8)}`,
          lines: lines,
        });
      }

      // Post the journal entry
      await this.journalEntriesService.post(journalEntry.id);

      // Update revaluation
      revaluation.status = RevaluationStatus.POSTED;
      revaluation.journalEntryId = journalEntry.id;
      await this.assetRevaluationRepository.save(revaluation);

      // Update asset value
      asset.currentValue = revaluation.newValue;
      asset.netBookValue = revaluation.newValue - parseFloat(asset.accumulatedDepreciation.toString());
      await this.assetRepository.save(asset);

      return {
        success: true,
        journal_entry_id: journalEntry.id,
      };
    } catch (error) {
      console.error('Error in AssetRevaluationsService.post:', error);
      throw error;
    }
  }
}

