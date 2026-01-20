import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { InventoryAdjustment, AdjustmentStatus } from './entities/inventory-adjustment.entity';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { UpdateInventoryAdjustmentDto } from './dto/update-inventory-adjustment.dto';
import { InventoryAdjustmentPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { EntryType, JournalEntryStatus } from '../journal-entries/entities/journal-entry.entity';
import { Account, AccountType } from '../accounts/entities/account.entity';

@Injectable()
export class InventoryAdjustmentsService {
  constructor(
    @InjectRepository(InventoryAdjustment)
    private readonly inventoryAdjustmentRepository: Repository<InventoryAdjustment>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly organizationsService: OrganizationsService,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  async create(createDto: CreateInventoryAdjustmentDto): Promise<InventoryAdjustment> {
    try {
      let organizationId = createDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Generate adjustment number if not provided
      let adjustmentNumber = createDto.adjustment_number;
      if (!adjustmentNumber) {
        adjustmentNumber = await this.generateAdjustmentNumber(organizationId);
      }

      // Calculate adjustment amount if not provided
      let adjustmentAmount = createDto.adjustment_amount;
      if (adjustmentAmount === undefined || adjustmentAmount === null) {
        adjustmentAmount = (createDto.quantity_adjusted || 0) * (createDto.unit_cost || 0);
      }

      // Verify account exists
      const account = await this.accountRepository.findOne({
        where: { id: createDto.account_id },
      });

      if (!account) {
        throw new BadRequestException(`Account with ID ${createDto.account_id} not found`);
      }

      const adjustment = this.inventoryAdjustmentRepository.create({
        organizationId: organizationId,
        adjustmentNumber: adjustmentNumber,
        adjustmentDate: new Date(createDto.adjustment_date),
        adjustmentType: createDto.adjustment_type,
        itemId: createDto.item_id,
        itemCode: null, // Will be populated from inventory if needed
        quantityAdjusted: createDto.quantity_adjusted || 0,
        unitCost: createDto.unit_cost || 0,
        adjustmentAmount: adjustmentAmount,
        accountId: createDto.account_id,
        reason: createDto.reason,
        status: AdjustmentStatus.DRAFT,
      });

      return await this.inventoryAdjustmentRepository.save(adjustment);
    } catch (error) {
      console.error('Error in InventoryAdjustmentsService.create:', error);
      throw error;
    }
  }

  async findAll(query: InventoryAdjustmentPaginationDto): Promise<InventoryAdjustment[]> {
    try {
      const queryBuilder = this.inventoryAdjustmentRepository.createQueryBuilder('adjustment');

      if (query.adjustment_type) {
        queryBuilder.andWhere('adjustment.adjustmentType = :adjustmentType', {
          adjustmentType: query.adjustment_type,
        });
      }

      if (query.sort) {
        const sortParts = query.sort.split(':');
        // Map snake_case to camelCase for database field names
        let sortField = sortParts[0] || 'adjustmentDate';
        // Convert snake_case to camelCase (e.g., adjustment_date -> adjustmentDate)
        if (sortField.includes('_')) {
          sortField = sortField.split('_').map((part, index) => 
            index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
          ).join('');
        }
        // Validate sort field to prevent SQL injection
        const validSortFields = ['adjustmentDate', 'adjustmentNumber', 'adjustmentType', 'status', 'createdDate', 'updatedAt'];
        if (!validSortFields.includes(sortField)) {
          sortField = 'adjustmentDate';
        }
        const sortOrder = sortParts[1]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        queryBuilder.orderBy(`adjustment.${sortField}`, sortOrder);
      } else {
        queryBuilder.orderBy('adjustment.adjustmentDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in InventoryAdjustmentsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<InventoryAdjustment> {
    try {
      const adjustment = await this.inventoryAdjustmentRepository.findOne({
        where: { id },
      });

      if (!adjustment) {
        throw new NotFoundException(`Inventory adjustment with ID ${id} not found`);
      }

      return adjustment;
    } catch (error) {
      console.error('Error in InventoryAdjustmentsService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateInventoryAdjustmentDto): Promise<InventoryAdjustment> {
    try {
      const adjustment = await this.findOne(id);

      if (adjustment.status === AdjustmentStatus.POSTED) {
        throw new BadRequestException('Cannot update a posted inventory adjustment');
      }

      // Recalculate adjustment amount if quantity or unit cost changed
      if (updateDto.quantity_adjusted !== undefined || updateDto.unit_cost !== undefined) {
        const quantityAdjusted = updateDto.quantity_adjusted ?? adjustment.quantityAdjusted;
        const unitCost = updateDto.unit_cost ?? adjustment.unitCost;
        updateDto.adjustment_amount = quantityAdjusted * unitCost;
      }

      Object.assign(adjustment, {
        ...(updateDto.adjustment_date && { adjustmentDate: new Date(updateDto.adjustment_date) }),
        ...(updateDto.adjustment_type && { adjustmentType: updateDto.adjustment_type }),
        ...(updateDto.item_id && { itemId: updateDto.item_id }),
        ...(updateDto.quantity_adjusted !== undefined && { quantityAdjusted: updateDto.quantity_adjusted }),
        ...(updateDto.unit_cost !== undefined && { unitCost: updateDto.unit_cost }),
        ...(updateDto.adjustment_amount !== undefined && { adjustmentAmount: updateDto.adjustment_amount }),
        ...(updateDto.account_id && { accountId: updateDto.account_id }),
        ...(updateDto.reason !== undefined && { reason: updateDto.reason }),
      });

      return await this.inventoryAdjustmentRepository.save(adjustment);
    } catch (error) {
      console.error('Error in InventoryAdjustmentsService.update:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const adjustment = await this.findOne(id);

      if (adjustment.status === AdjustmentStatus.POSTED) {
        throw new BadRequestException('Cannot delete a posted inventory adjustment');
      }

      await this.inventoryAdjustmentRepository.remove(adjustment);
    } catch (error) {
      console.error('Error in InventoryAdjustmentsService.remove:', error);
      throw error;
    }
  }

  async post(id: string): Promise<{ success: boolean; journal_entry_id: string }> {
    try {
      const adjustment = await this.findOne(id);

      if (adjustment.status === AdjustmentStatus.POSTED) {
        throw new BadRequestException('Inventory adjustment is already posted');
      }

      if (adjustment.journalEntryId) {
        throw new BadRequestException('Inventory adjustment already has a journal entry');
      }

      // Get account details
      const account = await this.accountRepository.findOne({
        where: { id: adjustment.accountId },
      });

      if (!account) {
        throw new BadRequestException(`Account with ID ${adjustment.accountId} not found`);
      }

      // Find inventory account (asset type account, preferably with inventory subtype)
      // For now, we'll try to find an inventory account, or use the provided account as fallback
      let inventoryAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.ASSET,
          accountSubtype: 'inventory',
          organizationId: adjustment.organizationId === null ? IsNull() : adjustment.organizationId,
        },
      });

      // If no inventory account found, try to find any asset account
      if (!inventoryAccount) {
        inventoryAccount = await this.accountRepository.findOne({
          where: {
            accountType: AccountType.ASSET,
            organizationId: adjustment.organizationId === null ? IsNull() : adjustment.organizationId,
          },
        });
      }

      // If still no inventory account, use the provided account (this is not ideal but will work)
      if (!inventoryAccount) {
        inventoryAccount = account;
      }

      // Determine debit/credit based on adjustment type
      let offsetDebit = 0;
      let offsetCredit = 0;
      let inventoryDebit = 0;
      let inventoryCredit = 0;

      if (adjustment.adjustmentType === 'write_off' || adjustment.adjustmentType === 'revaluation') {
        // Write-off or revaluation: Debit expense account (provided), Credit inventory
        offsetDebit = Math.abs(adjustment.adjustmentAmount);
        inventoryCredit = Math.abs(adjustment.adjustmentAmount);
      } else if (adjustment.adjustmentType === 'write_up') {
        // Write-up: Debit inventory, Credit income account (provided)
        inventoryDebit = Math.abs(adjustment.adjustmentAmount);
        offsetCredit = Math.abs(adjustment.adjustmentAmount);
      } else {
        // Other: Use adjustment amount as-is
        if (adjustment.adjustmentAmount >= 0) {
          offsetDebit = adjustment.adjustmentAmount;
          inventoryCredit = adjustment.adjustmentAmount;
        } else {
          inventoryDebit = Math.abs(adjustment.adjustmentAmount);
          offsetCredit = Math.abs(adjustment.adjustmentAmount);
        }
      }

      // Convert adjustmentDate to Date object if it's a string
      // TypeORM can return dates as strings or Date objects depending on the database driver
      const adjustmentDate = adjustment.adjustmentDate 
        ? (adjustment.adjustmentDate instanceof Date 
            ? adjustment.adjustmentDate 
            : new Date(adjustment.adjustmentDate))
        : new Date();

      // Create journal entry
      const journalEntryDto = {
        organization_id: adjustment.organizationId || undefined,
        entry_number: `IA-${adjustment.adjustmentNumber || adjustment.id.substring(0, 8)}`,
        entry_date: adjustmentDate && !isNaN(adjustmentDate.getTime()) 
          ? adjustmentDate.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        entry_type: EntryType.ADJUSTMENT,
        description: `Inventory Adjustment: ${adjustment.adjustmentType} - ${adjustment.reason || 'No reason provided'}`,
        reference: adjustment.adjustmentNumber || undefined,
        status: JournalEntryStatus.POSTED,
        lines: [
          {
            account_id: adjustment.accountId,
            debit: offsetDebit,
            credit: offsetCredit,
            description: `Inventory Adjustment - ${adjustment.adjustmentType}`,
          },
          {
            account_id: inventoryAccount.id,
            debit: inventoryDebit,
            credit: inventoryCredit,
            description: `Inventory Adjustment - ${adjustment.adjustmentType}`,
          },
        ],
      };

      const journalEntry = await this.journalEntriesService.create(journalEntryDto);

      // Update adjustment status and link journal entry
      adjustment.status = AdjustmentStatus.POSTED;
      adjustment.journalEntryId = journalEntry.id;
      await this.inventoryAdjustmentRepository.save(adjustment);

      return {
        success: true,
        journal_entry_id: journalEntry.id,
      };
    } catch (error) {
      console.error('Error in InventoryAdjustmentsService.post:', error);
      throw error;
    }
  }

  private async generateAdjustmentNumber(organizationId: string | null): Promise<string> {
    const prefix = 'IA';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.inventoryAdjustmentRepository
      .createQueryBuilder('adjustment')
      .where('adjustment.adjustmentNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('adjustment.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('adjustment.organizationId IS NULL');
    }

    queryBuilder.orderBy('adjustment.adjustmentNumber', 'DESC').limit(1);

    const lastAdjustment = await queryBuilder.getOne();

    let sequence = 1;
    if (lastAdjustment && lastAdjustment.adjustmentNumber) {
      const parts = lastAdjustment.adjustmentNumber.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}

