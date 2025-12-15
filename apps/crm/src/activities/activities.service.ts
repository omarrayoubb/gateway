import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateActivityDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';

export interface PaginatedActivitiesResult {
  data: ActivityResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Validates mutual exclusivity - exactly one of leadId, contactId, dealId, or accountId must be provided
   */
  private validateMutualExclusivity(
    leadId?: string | null, 
    contactId?: string | null, 
    dealId?: string | null, 
    accountId?: string | null
  ): void {
    const ids = [leadId, contactId, dealId, accountId].filter(id => id !== null && id !== undefined);
    
    if (ids.length === 0) {
      throw new BadRequestException('Activity must be assigned to either a lead, contact, deal, or account.');
    }
    
    if (ids.length > 1) {
      throw new BadRequestException('Activity can only be assigned to one entity (lead, contact, deal, or account).');
    }
  }

  /**
   * Creates a new activity
   */
  async create(
    createActivityDto: CreateActivityDto,
    currentUser: { id: string; name: string; email: string }
  ): Promise<ActivityResponseDto> {
    // Validate mutual exclusivity
    this.validateMutualExclusivity(
      createActivityDto.leadId, 
      createActivityDto.contactId, 
      createActivityDto.dealId, 
      createActivityDto.accountId
    );

    // Validate that the related entity exists
    if (createActivityDto.leadId) {
      const lead = await this.leadRepository.findOneBy({ id: createActivityDto.leadId });
      if (!lead) {
        throw new NotFoundException(`Lead with ID ${createActivityDto.leadId} not found`);
      }
    }

    if (createActivityDto.contactId) {
      const contact = await this.contactRepository.findOneBy({ id: createActivityDto.contactId });
      if (!contact) {
        throw new NotFoundException(`Contact with ID ${createActivityDto.contactId} not found`);
      }
    }

    // Note: Deal and Account validation would require their repositories
    // For now, we'll let the database foreign key constraint handle it

    const newActivity = this.activityRepository.create({
      ...createActivityDto,
      meetingDateTime: new Date(createActivityDto.meetingDateTime),
      duration: new Date(createActivityDto.duration),
      createdBy: currentUser.name,
    });

    const savedActivity = await this.activityRepository.save(newActivity);

    // Get the full activity data and transform it
    const fullActivity = await this.getFullActivityById(savedActivity.id);
    return this._transformActivityToResponse(fullActivity);
  }

  /**
   * Finds all activities with pagination
   */
  async findAll(paginationQuery: PaginationQueryDto): Promise<any> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.activityRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
      relations: ['lead', 'contact', 'deal', 'account'],
    });

    const lastPage = Math.ceil(total / limit);

    const transformedData = data.map(activity => this._transformActivityToResponse(activity));

    return {
      data: transformedData,
      total,
      page,
      lastPage,
    };
  }

  /**
   * Finds a single activity by its ID
   */
  async findOne(id: string): Promise<ActivityResponseDto> {
    const activity = await this.getFullActivityById(id);
    return this._transformActivityToResponse(activity);
  }

  /**
   * Updates an existing activity
   */
  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    currentUser: { id: string; name: string; email: string }
  ): Promise<ActivityResponseDto> {
    const activity = await this.activityRepository.findOneBy({ id });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    // If updating relationships, validate mutual exclusivity
    if (updateActivityDto.leadId !== undefined || updateActivityDto.contactId !== undefined || 
        updateActivityDto.dealId !== undefined || updateActivityDto.accountId !== undefined) {
      const newLeadId = updateActivityDto.leadId !== undefined ? updateActivityDto.leadId : activity.leadId;
      const newContactId = updateActivityDto.contactId !== undefined ? updateActivityDto.contactId : activity.contactId;
      const newDealId = updateActivityDto.dealId !== undefined ? updateActivityDto.dealId : activity.dealId;
      const newAccountId = updateActivityDto.accountId !== undefined ? updateActivityDto.accountId : activity.accountId;
      
      this.validateMutualExclusivity(newLeadId, newContactId, newDealId, newAccountId);

      // Validate that the new related entity exists
      if (newLeadId) {
        const lead = await this.leadRepository.findOneBy({ id: newLeadId });
        if (!lead) {
          throw new NotFoundException(`Lead with ID ${newLeadId} not found`);
        }
      }

      if (newContactId) {
        const contact = await this.contactRepository.findOneBy({ id: newContactId });
        if (!contact) {
          throw new NotFoundException(`Contact with ID ${newContactId} not found`);
        }
      }
    }

    // Update the activity
    Object.assign(activity, updateActivityDto);
    
    if (updateActivityDto.meetingDateTime) {
      activity.meetingDateTime = new Date(updateActivityDto.meetingDateTime);
    }

    if (updateActivityDto.duration) {
      activity.duration = new Date(updateActivityDto.duration);
    }

    await this.activityRepository.save(activity);

    // Get the full activity data and transform it
    const fullActivity = await this.getFullActivityById(id);
    return this._transformActivityToResponse(fullActivity);
  }

  /**
   * Deletes an activity
   */
  async remove(id: string): Promise<void> {
    const activity = await this.activityRepository.findOneBy({ id });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    await this.activityRepository.remove(activity);
  }

  /**
   * Bulk delete activities
   */
  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all activities that exist
    const activities = await this.activityRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(activities.map((a) => a.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Activity not found' });
      }
    }

    // Delete all found activities
    if (activities.length > 0) {
      await this.activityRepository.remove(activities);
      deletedCount = activities.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  /**
   * Bulk update activities - applies the same update fields to multiple activities
   */
  async bulkUpdate(
    bulkUpdateDto: BulkUpdateActivityDto,
    currentUser: { id: string; name: string; email: string },
  ): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all activities that exist
    const activities = await this.activityRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(activities.map((a) => a.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Activity not found' });
      }
    }

    // Process each activity
    for (const activity of activities) {
      try {
        // If updating relationships, validate mutual exclusivity
        if (updateFields.leadId !== undefined || updateFields.contactId !== undefined || 
            updateFields.dealId !== undefined || updateFields.accountId !== undefined) {
          const newLeadId = updateFields.leadId !== undefined ? updateFields.leadId : activity.leadId;
          const newContactId = updateFields.contactId !== undefined ? updateFields.contactId : activity.contactId;
          const newDealId = updateFields.dealId !== undefined ? updateFields.dealId : activity.dealId;
          const newAccountId = updateFields.accountId !== undefined ? updateFields.accountId : activity.accountId;

          this.validateMutualExclusivity(newLeadId, newContactId, newDealId, newAccountId);
        }

        Object.assign(activity, updateFields);

        if (updateFields.meetingDateTime) {
          activity.meetingDateTime = new Date(updateFields.meetingDateTime);
        }

        if (updateFields.duration) {
          activity.duration = new Date(updateFields.duration);
        }

        await this.activityRepository.save(activity);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: activity.id,
          error: error.message || 'Failed to update activity',
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
   * Gets a single activity by ID with all relations loaded
   */
  private async getFullActivityById(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['lead', 'contact', 'deal', 'account'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  /**
   * Transforms a full Activity entity into the response format
   */
  private _transformActivityToResponse(activity: Activity): ActivityResponseDto {
    return {
      id: activity.id,
      activityType: activity.activityType,
      subject: activity.subject,
      meetingDateTime: activity.meetingDateTime,
      duration: activity.duration,
      outcome: activity.outcome,
      status: activity.status,
      description: activity.description,
      createdBy: activity.createdBy,
      createdAt: activity.createdAt,
      leadId: activity.leadId,
      contactId: activity.contactId,
      lead: activity.lead ? {
        id: activity.lead.id,
        first_name: activity.lead.first_name,
        last_name: activity.lead.last_name,
      } : null,
      contact: activity.contact ? {
        id: activity.contact.id,
        first_name: activity.contact.first_name,
        last_name: activity.contact.last_name,
      } : null,
      deal: activity.deal ? {
        id: activity.deal.id,
        name: activity.deal.name,
      } : null,
      account: activity.account ? {
        id: activity.account.id,
        name: activity.account.name,
        accountNumber: activity.account.accountNumber,
      } : null,
      dealId: activity.dealId,
      accountId: activity.accountId,
    };
  }
}

