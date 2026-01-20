import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Depreciation, DepreciationStatus } from './entities/depreciation.entity';
import { Asset, DepreciationMethod } from '../assets/entities/asset.entity';
import { CreateDepreciationDto } from './dto/create-depreciation.dto';
import { UpdateDepreciationDto } from './dto/update-depreciation.dto';
import { DepreciationPaginationDto } from './dto/pagination.dto';
import { CalculateDepreciationDto } from './dto/calculate-depreciation.dto';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { Account } from '../accounts/entities/account.entity';
import { AccountType } from '../accounts/entities/account.entity';
// Date utility functions
const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};

const format = (date: Date, formatStr: string): string => {
  if (formatStr === 'yyyy-MM') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  return date.toISOString().split('T')[0];
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

@Injectable()
export class DepreciationsService {
  constructor(
    @InjectRepository(Depreciation)
    private readonly depreciationRepository: Repository<Depreciation>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateDepreciationDto): Promise<Depreciation> {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id: createDto.asset_id },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${createDto.asset_id} not found`);
      }

      const depreciation = this.depreciationRepository.create({
        organizationId: createDto.organization_id || asset.organizationId,
        assetId: createDto.asset_id,
        assetCode: asset.assetCode,
        assetName: asset.assetName,
        depreciationDate: new Date(createDto.depreciation_date),
        period: createDto.period,
        depreciationAmount: createDto.depreciation_amount || 0,
        accumulatedDepreciation: createDto.accumulated_depreciation || 0,
        netBookValue: createDto.net_book_value || 0,
        status: createDto.status || DepreciationStatus.PENDING,
      });

      return await this.depreciationRepository.save(depreciation);
    } catch (error) {
      console.error('Error in DepreciationsService.create:', error);
      throw error;
    }
  }

  async findAll(query: DepreciationPaginationDto): Promise<Depreciation[]> {
    try {
      const queryBuilder = this.depreciationRepository.createQueryBuilder('depreciation');

      if (query.asset_id) {
        queryBuilder.andWhere('depreciation.assetId = :assetId', {
          assetId: query.asset_id,
        });
      }

      if (query.period_start && query.period_end) {
        queryBuilder.andWhere('depreciation.depreciationDate BETWEEN :start AND :end', {
          start: query.period_start,
          end: query.period_end,
        });
      } else if (query.period_start) {
        queryBuilder.andWhere('depreciation.depreciationDate >= :start', {
          start: query.period_start,
        });
      } else if (query.period_end) {
        queryBuilder.andWhere('depreciation.depreciationDate <= :end', {
          end: query.period_end,
        });
      }

      queryBuilder.orderBy('depreciation.depreciationDate', 'DESC');

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in DepreciationsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Depreciation> {
    try {
      const depreciation = await this.depreciationRepository.findOne({
        where: { id },
        relations: ['asset'],
      });

      if (!depreciation) {
        throw new NotFoundException(`Depreciation with ID ${id} not found`);
      }

      return depreciation;
    } catch (error) {
      console.error('Error in DepreciationsService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateDepreciationDto): Promise<Depreciation> {
    try {
      const depreciation = await this.findOne(id);

      Object.assign(depreciation, {
        ...(updateDto.depreciation_date && { depreciationDate: new Date(updateDto.depreciation_date) }),
        ...(updateDto.period && { period: updateDto.period }),
        ...(updateDto.depreciation_amount !== undefined && { depreciationAmount: updateDto.depreciation_amount }),
        ...(updateDto.accumulated_depreciation !== undefined && { accumulatedDepreciation: updateDto.accumulated_depreciation }),
        ...(updateDto.net_book_value !== undefined && { netBookValue: updateDto.net_book_value }),
        ...(updateDto.status && { status: updateDto.status }),
      });

      return await this.depreciationRepository.save(depreciation);
    } catch (error) {
      console.error('Error in DepreciationsService.update:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const depreciation = await this.findOne(id);
      await this.depreciationRepository.remove(depreciation);
    } catch (error) {
      console.error('Error in DepreciationsService.remove:', error);
      throw error;
    }
  }

  async calculate(calculateDto: CalculateDepreciationDto): Promise<any> {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id: calculateDto.asset_id },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${calculateDto.asset_id} not found`);
      }

      const periodStart = parseISO(calculateDto.period_start);
      const periodEnd = parseISO(calculateDto.period_end);

      // Get existing depreciations for this asset
      const existingDepreciations = await this.depreciationRepository.find({
        where: {
          assetId: calculateDto.asset_id,
          status: DepreciationStatus.POSTED,
        },
        order: { depreciationDate: 'ASC' },
      });

      const totalAccumulatedDepreciation = existingDepreciations.reduce(
        (sum, dep) => sum + parseFloat(dep.accumulatedDepreciation.toString()),
        0,
      );

      const startingBookValue = parseFloat(asset.purchasePrice.toString()) - totalAccumulatedDepreciation;
      const salvageValue = parseFloat(asset.salvageValue.toString());
      const usefulLifeYears = asset.usefulLifeYears || 1;
      const usefulLifeMonths = usefulLifeYears * 12;

      const schedule: any[] = [];
      let currentBookValue = startingBookValue;
      let accumulatedDepreciation = totalAccumulatedDepreciation;
      let currentDate = startOfMonth(periodStart);

      while (currentDate <= periodEnd && currentBookValue > salvageValue) {
        const period = format(currentDate, 'yyyy-MM');
        let depreciationAmount = 0;

        switch (asset.depreciationMethod) {
          case DepreciationMethod.STRAIGHT_LINE:
            depreciationAmount = (parseFloat(asset.purchasePrice.toString()) - salvageValue) / usefulLifeMonths;
            break;

          case DepreciationMethod.DECLINING_BALANCE:
            const rate = 2 / usefulLifeMonths; // Double declining balance
            depreciationAmount = currentBookValue * rate;
            // Ensure we don't depreciate below salvage value
            if (currentBookValue - depreciationAmount < salvageValue) {
              depreciationAmount = currentBookValue - salvageValue;
            }
            break;

          case DepreciationMethod.UNITS_OF_PRODUCTION:
            // For units of production, we'd need usage data - defaulting to straight line
            depreciationAmount = (parseFloat(asset.purchasePrice.toString()) - salvageValue) / usefulLifeMonths;
            break;

          default:
            depreciationAmount = (parseFloat(asset.purchasePrice.toString()) - salvageValue) / usefulLifeMonths;
        }

        // Round to 2 decimal places
        depreciationAmount = Math.round(depreciationAmount * 100) / 100;

        if (depreciationAmount > 0 && currentBookValue - depreciationAmount >= salvageValue) {
          accumulatedDepreciation += depreciationAmount;
          currentBookValue -= depreciationAmount;

          schedule.push({
            period,
            depreciation_amount: depreciationAmount,
            accumulated_depreciation: accumulatedDepreciation,
            net_book_value: currentBookValue,
          });
        }

        currentDate = addMonths(currentDate, 1);
      }

      const totalDepreciation = schedule.reduce(
        (sum, item) => sum + item.depreciation_amount,
        0,
      );

      return {
        asset_id: asset.id,
        asset_name: asset.assetName,
        period_start: calculateDto.period_start,
        period_end: calculateDto.period_end,
        depreciation_schedule: schedule,
        total_depreciation: totalDepreciation,
      };
    } catch (error) {
      console.error('Error in DepreciationsService.calculate:', error);
      throw error;
    }
  }

  async getSchedule(assetId: string): Promise<any> {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      const depreciations = await this.depreciationRepository.find({
        where: { assetId },
        order: { depreciationDate: 'ASC' },
      });

      const schedule = depreciations.map(dep => ({
        period: dep.period,
        depreciation_amount: parseFloat(dep.depreciationAmount.toString()),
        accumulated_depreciation: parseFloat(dep.accumulatedDepreciation.toString()),
        net_book_value: parseFloat(dep.netBookValue.toString()),
        status: dep.status,
      }));

      const totalDepreciation = depreciations.reduce(
        (sum, dep) => sum + parseFloat(dep.depreciationAmount.toString()),
        0,
      );

      const remainingLifeYears = asset.usefulLifeYears
        ? Math.max(0, asset.usefulLifeYears - (depreciations.length / 12))
        : 0;

      return {
        asset: {
          id: asset.id,
          asset_code: asset.assetCode,
          asset_name: asset.assetName,
          purchase_price: parseFloat(asset.purchasePrice.toString()),
          current_value: parseFloat(asset.currentValue.toString()),
          accumulated_depreciation: parseFloat(asset.accumulatedDepreciation.toString()),
          net_book_value: parseFloat(asset.netBookValue.toString()),
          depreciation_method: asset.depreciationMethod,
          useful_life_years: asset.usefulLifeYears,
          salvage_value: parseFloat(asset.salvageValue.toString()),
        },
        depreciation_schedule: schedule,
        total_depreciation: totalDepreciation,
        remaining_life_years: remainingLifeYears,
      };
    } catch (error) {
      console.error('Error in DepreciationsService.getSchedule:', error);
      throw error;
    }
  }

  async post(id: string): Promise<{ success: boolean; journal_entry_id: string }> {
    try {
      const depreciation = await this.findOne(id);

      if (depreciation.status === DepreciationStatus.POSTED) {
        throw new BadRequestException('Depreciation is already posted');
      }

      const asset = await this.assetRepository.findOne({
        where: { id: depreciation.assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${depreciation.assetId} not found`);
      }

      // Find depreciation expense account
      const expenseAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.EXPENSE,
          accountSubtype: 'Depreciation',
        },
      });

      if (!expenseAccount) {
        throw new NotFoundException('Depreciation expense account not found. Please create an account with type EXPENSE and subtype Depreciation.');
      }

      // Find or use asset's account
      const assetAccount = await this.accountRepository.findOne({
        where: { id: asset.accountId },
      });

      if (!assetAccount) {
        throw new NotFoundException(`Asset account with ID ${asset.accountId} not found`);
      }

      // Create journal entry
      const journalEntry = await this.journalEntriesService.create({
        organization_id: depreciation.organizationId || undefined,
        entry_number: `DEP-${depreciation.period}`,
        entry_date: depreciation.depreciationDate.toISOString().split('T')[0],
        entry_type: 'adjustment' as any,
        description: `Depreciation for ${asset.assetName} - ${depreciation.period}`,
        reference: `DEP-${depreciation.period}`,
        lines: [
          {
            account_id: expenseAccount.id,
            description: `Depreciation Expense - ${asset.assetName}`,
            debit: depreciation.depreciationAmount,
            credit: 0,
          },
          {
            account_id: assetAccount.id,
            description: `Accumulated Depreciation - ${asset.assetName}`,
            debit: 0,
            credit: depreciation.depreciationAmount,
          },
        ],
      });

      // Post the journal entry
      await this.journalEntriesService.post(journalEntry.id);

      // Update depreciation
      depreciation.status = DepreciationStatus.POSTED;
      depreciation.journalEntryId = journalEntry.id;
      await this.depreciationRepository.save(depreciation);

      // Update asset accumulated depreciation and net book value
      asset.accumulatedDepreciation = parseFloat(asset.accumulatedDepreciation.toString()) + parseFloat(depreciation.depreciationAmount.toString());
      asset.netBookValue = parseFloat(asset.purchasePrice.toString()) - parseFloat(asset.accumulatedDepreciation.toString());
      asset.currentValue = asset.netBookValue;
      await this.assetRepository.save(asset);

      return {
        success: true,
        journal_entry_id: journalEntry.id,
      };
    } catch (error) {
      console.error('Error in DepreciationsService.post:', error);
      throw error;
    }
  }
}

