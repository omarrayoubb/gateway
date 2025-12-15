import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { UserSync } from '../users/users-sync.entity';
import { Account } from '../accounts/entities/accounts.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';
import { DealResponseDto } from './dto/deal-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateDealDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

export interface PaginatedDealsResult {
  data: DealResponseDto[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(UserSync)
    private readonly userSyncRepository: Repository<UserSync>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Creates a new deal
   */
  async create(createDealDto: CreateDealDto, currentUser: any): Promise<DealResponseDto> {
    // Validate that either leadId OR contactId is provided (not both, not neither)
    const hasLeadId = createDealDto.leadId !== null && createDealDto.leadId !== undefined;
    const hasContactId = createDealDto.contactId !== null && createDealDto.contactId !== undefined;

    if (!hasLeadId && !hasContactId) {
      throw new BadRequestException('Either leadId OR contactId must be provided');
    }

    if (hasLeadId && hasContactId) {
      throw new BadRequestException('Cannot provide both leadId and contactId. Only one is allowed.');
    }

    // Validate account exists
    const account = await this.accountRepository.findOneBy({ id: createDealDto.accountId });
    if (!account) {
      throw new NotFoundException(`Account with ID ${createDealDto.accountId} not found`);
    }

    // Validate owner exists
    const owner = await this.userSyncRepository.findOneBy({ id: createDealDto.ownerId });
    if (!owner) {
      throw new NotFoundException(`User with ID ${createDealDto.ownerId} not found`);
    }

    // Validate lead or contact exists
    if (hasLeadId) {
      const lead = await this.leadRepository.findOneBy({ id: createDealDto.leadId! });
      if (!lead) {
        throw new NotFoundException(`Lead with ID ${createDealDto.leadId} not found`);
      }
    } else {
      const contact = await this.contactRepository.findOneBy({ id: createDealDto.contactId! });
      if (!contact) {
        throw new NotFoundException(`Contact with ID ${createDealDto.contactId} not found`);
      }
    }

    // Prepare deal data
    const dealData: Partial<Deal> = {
      ...createDealDto,
      createdBy: currentUser.name, // String field
      modifiedBy: currentUser.name, // String field
      leadId: hasLeadId ? createDealDto.leadId! : null,
      contactId: hasContactId ? createDealDto.contactId! : null,
    };

    if (createDealDto.closingDate) {
      dealData.closingDate = new Date(createDealDto.closingDate);
    }

    const newDeal = this.dealRepository.create(dealData);
    const savedDeal = await this.dealRepository.save(newDeal);
    
    const fullDeal = await this.getFullDealById(savedDeal.id);
    return this._transformDealToResponse(fullDeal);
  }

  /**
   * Get all deals with pagination
   */
  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedDealsResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.dealRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
      relations: ['account', 'lead', 'contact', 'owner'],
    });

    const lastPage = Math.ceil(total / limit);
    const transformedData = data.map((deal) => this._transformDealToResponse(deal));

    return {
      data: transformedData,
      total,
      page,
      limit,
      lastPage,
    };
  }

  /**
   * Get a single deal by ID
   */
  async findOne(id: string): Promise<DealResponseDto> {
    const deal = await this.getFullDealById(id);
    return this._transformDealToResponse(deal);
  }

  /**
   * Update a deal
   */
  async update(
    id: string,
    updateDealDto: UpdateDealDto,
    currentUser: any,
  ): Promise<DealResponseDto> {
    const deal = await this.dealRepository.findOne({
      where: { id },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    // Validate leadId/contactId mutual exclusivity if provided
    if (updateDealDto.leadId !== undefined || updateDealDto.contactId !== undefined) {
      const newLeadId = updateDealDto.leadId !== undefined ? updateDealDto.leadId : deal.leadId;
      const newContactId = updateDealDto.contactId !== undefined ? updateDealDto.contactId : deal.contactId;
      
      const hasLeadId = newLeadId !== null && newLeadId !== undefined;
      const hasContactId = newContactId !== null && newContactId !== undefined;

      if (hasLeadId && hasContactId) {
        throw new BadRequestException('Cannot set both leadId and contactId. Only one is allowed.');
      }

      if (!hasLeadId && !hasContactId) {
        throw new BadRequestException('Either leadId OR contactId must be provided');
      }

      // Validate lead or contact exists if provided
      if (hasLeadId && updateDealDto.leadId) {
        const lead = await this.leadRepository.findOneBy({ id: updateDealDto.leadId });
        if (!lead) {
          throw new NotFoundException(`Lead with ID ${updateDealDto.leadId} not found`);
        }
      }

      if (hasContactId && updateDealDto.contactId) {
        const contact = await this.contactRepository.findOneBy({ id: updateDealDto.contactId });
        if (!contact) {
          throw new NotFoundException(`Contact with ID ${updateDealDto.contactId} not found`);
        }
      }
    }

    // Validate account if provided
    if (updateDealDto.accountId) {
      const account = await this.accountRepository.findOneBy({ id: updateDealDto.accountId });
      if (!account) {
        throw new NotFoundException(`Account with ID ${updateDealDto.accountId} not found`);
      }
    }

    // Validate owner if provided
    if (updateDealDto.ownerId) {
      const owner = await this.userSyncRepository.findOneBy({ id: updateDealDto.ownerId });
      if (!owner) {
        throw new NotFoundException(`User with ID ${updateDealDto.ownerId} not found`);
      }
    }

    // Prepare update data
    const updateData: Partial<any> = {
      ...updateDealDto,
      modifiedBy: currentUser.name, // Always update modifiedBy
    };

    if (updateDealDto.closingDate) {
      updateData.closingDate = new Date(updateDealDto.closingDate);
    }

    Object.assign(deal, updateData);
    const savedDeal = await this.dealRepository.save(deal);
    
    const fullDeal = await this.getFullDealById(savedDeal.id);
    return this._transformDealToResponse(fullDeal);
  }

  /**
   * Delete a deal
   */
  async remove(id: string): Promise<void> {
    const deal = await this.dealRepository.findOneBy({ id });
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }
    await this.dealRepository.remove(deal);
  }

  /**
   * Bulk delete deals
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all deals that exist
    const deals = await this.dealRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(deals.map((d) => d.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Deal not found' });
      }
    }

    // Delete all found deals
    if (deals.length > 0) {
      await this.dealRepository.remove(deals);
      deletedCount = deals.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update deals - applies the same update fields to multiple deals
   */
  async bulkUpdate(
    bulkUpdateDto: BulkUpdateDealDto,
    currentUser: any,
  ): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Validate leadId/contactId mutual exclusivity if provided
    if (updateFields.leadId !== undefined || updateFields.contactId !== undefined) {
      const hasLeadId = updateFields.leadId !== null && updateFields.leadId !== undefined;
      const hasContactId = updateFields.contactId !== null && updateFields.contactId !== undefined;

      if (hasLeadId && hasContactId) {
        return {
          updatedCount: 0,
          failedItems: ids.map((id) => ({
            id,
            error: 'Cannot set both leadId and contactId. Only one is allowed.',
          })),
        };
      }
    }

    // Find all deals that exist
    const deals = await this.dealRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(deals.map((d) => d.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Deal not found' });
      }
    }

    // Process each deal
    for (const deal of deals) {
      // Skip if already failed validation
      if (failedItems.some((f) => f.id === deal.id)) {
        continue;
      }

      try {
        // Check leadId/contactId mutual exclusivity for this deal
        const newLeadId = updateFields.leadId !== undefined ? updateFields.leadId : deal.leadId;
        const newContactId = updateFields.contactId !== undefined ? updateFields.contactId : deal.contactId;
        
        const hasLeadId = newLeadId !== null && newLeadId !== undefined;
        const hasContactId = newContactId !== null && newContactId !== undefined;

        if (hasLeadId && hasContactId) {
          failedItems.push({
            id: deal.id,
            error: 'Cannot set both leadId and contactId. Only one is allowed.',
          });
          continue;
        }

        // Validate references if provided
        if (updateFields.accountId) {
          const account = await this.accountRepository.findOneBy({ id: updateFields.accountId });
          if (!account) {
            failedItems.push({
              id: deal.id,
              error: `Account with ID ${updateFields.accountId} not found`,
            });
            continue;
          }
        }

        if (updateFields.ownerId) {
          const owner = await this.userSyncRepository.findOneBy({ id: updateFields.ownerId });
          if (!owner) {
            failedItems.push({
              id: deal.id,
              error: `User with ID ${updateFields.ownerId} not found`,
            });
            continue;
          }
        }

        // Prepare update data
        const updateData: Partial<any> = {
          ...updateFields,
          modifiedBy: currentUser.name,
        };

        if (updateFields.closingDate) {
          updateData.closingDate = new Date(updateFields.closingDate);
        }

        Object.assign(deal, updateData);
        await this.dealRepository.save(deal);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: deal.id,
          error: error.message || 'Failed to update deal',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  /**
   * Get full deal with all relations loaded
   */
  private async getFullDealById(id: string): Promise<Deal> {
    const deal = await this.dealRepository.findOne({
      where: { id },
      relations: ['account', 'lead', 'contact', 'owner'],
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }

    return deal;
  }

  /**
   * Transform Deal entity to DealResponseDto
   */
  private _transformDealToResponse(deal: Deal): DealResponseDto {
    // Build lead name from first_name and last_name
    let leadName: string | null = null;
    if (deal.lead) {
      leadName = `${deal.lead.first_name} ${deal.lead.last_name}`.trim();
    }

    // Build contact name from first_name and last_name
    let contactName: string | null = null;
    if (deal.contact) {
      contactName = `${deal.contact.first_name} ${deal.contact.last_name}`.trim();
    }

    return {
      id: deal.id,
      name: deal.name,
      amount: deal.amount,
      closingDate: deal.closingDate ? new Date(deal.closingDate) : null,
      currency: deal.currency,
      type: deal.type,
      stage: deal.stage,
      probability: deal.probability,
      leadSource: deal.leadSource,
      description: deal.description,
      boxFolderId: deal.boxFolderId,
      campaignSource: deal.campaignSource,
      quote: deal.quote,
      ownerId: deal.ownerId,
      accountId: deal.accountId,
      leadId: deal.leadId,
      contactId: deal.contactId,
      createdBy: deal.createdBy,
      modifiedBy: deal.modifiedBy,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
      Account: {
        id: deal.account.id,
        name: deal.account.name,
      },
      Lead: deal.lead
        ? {
            id: deal.lead.id,
            name: leadName!,
          }
        : null,
      Contact: deal.contact
        ? {
            id: deal.contact.id,
            name: contactName!,
          }
        : null,
    };
  }
}

