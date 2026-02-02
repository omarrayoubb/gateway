import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ErrorMessages } from '@app/common/errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { PaginationQueryDto } from './dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto copy';
import { UpdateLeadDto } from './dto/update-lead.dto copy';
import { User } from '../users/entities/user.entity';
import { LeadResponseDto } from './dto/lead-response.dto'; // <-- 1. Import new DTO
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateLeadDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';

// 2. Define the PaginatedLeadsResult interface
export interface PaginatedLeadsResult {
  data: LeadResponseDto[]; // <-- Use the new DTO
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  /**
   * Creates a new lead
   */
  async create(createLeadDto: CreateLeadDto, currentUser: Omit<any, 'password'>): Promise<LeadResponseDto> {
    const existingLead = await this.leadRepository.findOneBy({ 
      email: createLeadDto.email 
    });

    if (existingLead) {
      throw new ConflictException(ErrorMessages.alreadyExists('Lead', 'email', createLeadDto.email));
    }

    const newLead = this.leadRepository.create({
      ...createLeadDto,
      createdBy: currentUser.name,
      modifiedBy: currentUser.name,
      ownerId: createLeadDto.ownerId || currentUser.id,
    });

    const savedLead = await this.leadRepository.save(newLead);
    
    // Get the full lead data and transform it
    const fullLead = await this.getFullLeadById(savedLead.id);
    
    
    
    return this._transformLeadToResponse(fullLead);
  }

  /**
   * Finds all leads with pagination.
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedLeadsResult> {
    // Ensure page and limit are valid numbers
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    // Validate and ensure positive numbers
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await this.leadRepository.findAndCount({
      take: validLimit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
      // 3. Load all relations
      relations: ['owner', 'account', 'deals', 'activities'],
    });

    const lastPage = Math.ceil(total / validLimit);
    
    // 4. Transform the data - ensure data is an array
    const transformedData = Array.isArray(data) 
      ? data.map(lead => this._transformLeadToResponse(lead))
      : [];

    return {
      data: transformedData,
      total: total || 0,
      page: validPage,
      lastPage: lastPage || 0,
    };
  }

  /**
   * Finds a single lead by its ID.
   */
  async findOne(id: string): Promise<LeadResponseDto> {
    const lead = await this.getFullLeadById(id);
    return this._transformLeadToResponse(lead);
  }

  /**
   * Updates an existing lead
   */
  async update(
    id: string, 
    updateLeadDto: UpdateLeadDto, 
    currentUser: Omit<any, 'password'>
  ): Promise<LeadResponseDto> {
    const lead = await this.leadRepository.preload({
      id: id,
      ...updateLeadDto,
      modifiedBy: currentUser.name, // Set the modifier to the current user
    });

    if (!lead) {
      throw new NotFoundException(ErrorMessages.notFound('Lead', id));
    }

    await this.leadRepository.save(lead);
    
    // Get the full lead data and transform it
    const fullLead = await this.getFullLeadById(id);
    return this._transformLeadToResponse(fullLead);
  }

  /**
   * Deletes a lead
   */
  async remove(id: string): Promise<void> {
    // 5. Update remove to use findOneBy to get the entity
    const lead = await this.leadRepository.findOneBy({ id });
    if (!lead) {
      throw new NotFoundException(ErrorMessages.notFound('Lead', id));
    }
    
    await this.leadRepository.remove(lead);
  }

  /**
   * Bulk delete leads
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all leads that exist
    const leads = await this.leadRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(leads.map((l) => l.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: ErrorMessages.notFound('Lead', id) });
      }
    }

    // Delete all found leads
    if (leads.length > 0) {
      await this.leadRepository.remove(leads);
      deletedCount = leads.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update leads - applies the same update fields to multiple leads
   */
  async bulkUpdate(
    bulkUpdateDto: BulkUpdateLeadDto,
    currentUser: Omit<User, 'password'>,
  ): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all leads that exist
    const leads = await this.leadRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(leads.map((l) => l.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Lead not found' });
      }
    }

    // Process each lead
    for (const lead of leads) {
      try {
        const updatedLead = await this.leadRepository.preload({
          id: lead.id,
          ...updateFields,
          modifiedBy: currentUser.name, // Set the modifier to the current user
        });

        if (!updatedLead) {
          failedItems.push({ id: lead.id, error: ErrorMessages.notFound('Lead', lead.id) });
          continue;
        }

        await this.leadRepository.save(updatedLead);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: lead.id,
          error: error.message || 'Failed to update lead',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  // --- PRIVATE HELPER FUNCTIONS ---

  /**
   * Gets a single lead by ID with all relations loaded.
   */
  private async getFullLeadById(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: [
        'owner', 
        'account',
        'deals',
        'activities'
      ]
    });

    if (!lead) {
      throw new NotFoundException(ErrorMessages.notFound('Lead', id));
    }
    return lead;
  }

  /**
   * Transforms a full Lead entity into the rich response format.
   */
  private _transformLeadToResponse(lead: Lead): LeadResponseDto {
    
    let ownerFirstName = '';
    let ownerLastName = '';

    // Split the single 'name' field from the User entity
    // to fit the new 'SimpleUserData' interface.
    if (lead.owner?.name) {
      const nameParts = lead.owner.name.split(' ');
      ownerFirstName = nameParts[0] || '';
      ownerLastName = nameParts.slice(1).join(' ') || '';
    }

    return {
      // Base Lead fields
      id: lead.id,
      salutation: lead.salutation,
      first_name: lead.first_name,
      last_name: lead.last_name,
      phone: lead.phone,
      email: lead.email,
      shipping_street: lead.shipping_street,
      billing_city: lead.billing_city,
      product_name: lead.product_name,
      currency_code: lead.currency_code,
      employee_count: lead.employee_count,
      hq_code: lead.hq_code,
      billing_amount: lead.billing_amount,
      exchange_rate: lead.exchange_rate,
      shipping_street_2: lead.shipping_street_2,
      shipping_city: lead.shipping_city,
      shipping_state: lead.shipping_state,
      shipping_country: lead.shipping_country,
      shipping_zip_code: lead.shipping_zip_code,
      billing_street: lead.billing_street,
      billing_street_2: lead.billing_street_2,
      billing_state: lead.billing_state,
      billing_country: lead.billing_country,
      billing_zip_code: lead.billing_zip_code,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      
      // Foreign Key IDs block removed

      // Transformed fields (with names)
      Deals: (lead.deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
      })),
      Activities: (lead.activities || []).map(activity => ({
        id: activity.id,
        activityType: activity.activityType,
        subject: activity.subject,
      })),
      OwnerData: lead.owner ? {
        id: lead.owner.id,
        firstName: ownerFirstName,
        lastName: ownerLastName
      } : null,
      Created_by: lead.createdBy || '',
      Modified_by: lead.modifiedBy || '',
      Account_details: lead.account ? {
        id: lead.account.id,
        name: lead.account.name,
        accountNumber: lead.account.accountNumber
      } : null,
    };
  }
}