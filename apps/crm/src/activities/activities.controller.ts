import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ActivitiesService } from './activities.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateActivityRequest,
  UpdateActivityRequest,
  PaginationRequest,
  FindOneActivityRequest,
  DeleteActivityRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  ActivityResponse,
  PaginatedActivitiesResponse,
  DeleteActivityResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/activities';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateActivityDto } from './dto/bulk-update.dto';

@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @GrpcMethod('ActivitiesService', 'CreateActivity')
  async createActivity(
    data: CreateActivityRequest,
    metadata: Metadata,
  ): Promise<ActivityResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createActivityDto = this.mapCreateRequestToDto(data);
      const result = await this.activitiesService.create(createActivityDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM ActivitiesController.createActivity:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('ActivitiesService', 'FindAllActivities')
  async findAllActivities(data: PaginationRequest): Promise<PaginatedActivitiesResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.activitiesService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from ActivitiesService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(activity => this.mapResponseDtoToProto(activity)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllActivities:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch activities: ${error.message}`,
      });
    }
  }

  @GrpcMethod('ActivitiesService', 'FindOneActivity')
  async findOneActivity(data: FindOneActivityRequest): Promise<ActivityResponse> {
    try {
      const result = await this.activitiesService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM ActivitiesController.findOneActivity for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneActivity for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ActivitiesService', 'UpdateActivity')
  async updateActivity(
    data: UpdateActivityRequest,
    metadata: Metadata,
  ): Promise<ActivityResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateActivityDto = this.mapUpdateRequestToDto(data);
      const result = await this.activitiesService.update(data.id, updateActivityDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM ActivitiesController.updateActivity for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateActivity for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ActivitiesService', 'DeleteActivity')
  async deleteActivity(data: DeleteActivityRequest): Promise<DeleteActivityResponse> {
    try {
      await this.activitiesService.remove(data.id);
      return { success: true };
    } catch (error) {
      console.error(`Error in CRM ActivitiesController.deleteActivity for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteActivity for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ActivitiesService', 'BulkDeleteActivities')
  async bulkDeleteActivities(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.activitiesService.bulkRemove(bulkDeleteDto);
      return {
        deletedCount: result.deletedCount,
        failedIds: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in CRM ActivitiesController.bulkDeleteActivities:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteActivities',
      });
    }
  }

  @GrpcMethod('ActivitiesService', 'BulkUpdateActivities')
  async bulkUpdateActivities(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateActivityDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.updateFields),
      };
      const result = await this.activitiesService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updatedCount: result.updatedCount,
        failedItems: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in CRM ActivitiesController.bulkUpdateActivities:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateActivities',
      });
    }
  }

  private extractUserFromMetadata(metadata: Metadata): { id: string; name: string; email: string } {
    const userId = metadata.get('user-id')[0] as string;
    const userName = metadata.get('user-name')[0] as string;
    const userEmail = metadata.get('user-email')[0] as string;

    if (!userId || !userName || !userEmail) {
      throw new RpcException({
        code: 16,
        message: 'User information missing from metadata',
      });
    }

    return {
      id: userId,
      name: userName,
      email: userEmail,
    };
  }

  private mapCreateRequestToDto(data: CreateActivityRequest): CreateActivityDto {
    const missingFields: string[] = [];
    if (!data.activityType) missingFields.push('activityType');
    if (!data.subject) missingFields.push('subject');
    if (!data.meetingDateTime) missingFields.push('meetingDateTime');
    if (!data.duration) missingFields.push('duration');
    if (!data.status) missingFields.push('status');

    if (missingFields.length > 0) {
      throw new RpcException({
        code: 3,
        message: `Required fields missing or empty: ${missingFields.join(', ')} are required`,
      });
    }

    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      activityType: data.activityType,
      subject: data.subject,
      meetingDateTime: data.meetingDateTime,
      duration: data.duration,
      status: data.status,
      outcome: safeValue(data.outcome),
      description: safeValue(data.description),
      leadId: safeValue(data.leadId),
      contactId: safeValue(data.contactId),
      dealId: safeValue(data.dealId),
      accountId: safeValue(data.accountId),
    };
  }

  private mapUpdateRequestToDto(data: UpdateActivityRequest): UpdateActivityDto {
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    const safeDate = (value: string | null | undefined): string | undefined => {
      if (!value || value === '') return undefined;
      return value;
    };

    return {
      activityType: safeValue(data.activityType),
      subject: safeValue(data.subject),
      meetingDateTime: safeDate(data.meetingDateTime),
      duration: safeDate(data.duration),
      status: safeValue(data.status),
      outcome: safeValue(data.outcome),
      description: safeValue(data.description),
      leadId: data.leadId !== undefined ? (data.leadId === null ? null : safeValue(data.leadId)) : undefined,
      contactId: data.contactId !== undefined ? (data.contactId === null ? null : safeValue(data.contactId)) : undefined,
      dealId: data.dealId !== undefined ? (data.dealId === null ? null : safeValue(data.dealId)) : undefined,
      accountId: data.accountId !== undefined ? (data.accountId === null ? null : safeValue(data.accountId)) : undefined,
    };
  }

  private mapUpdateFieldsToDto(fields: any): UpdateActivityDto {
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    const safeDate = (value: string | null | undefined): string | undefined => {
      if (!value || value === '') return undefined;
      return value;
    };

    return {
      activityType: safeValue(fields.activityType),
      subject: safeValue(fields.subject),
      meetingDateTime: safeDate(fields.meetingDateTime),
      duration: safeDate(fields.duration),
      status: safeValue(fields.status),
      outcome: safeValue(fields.outcome),
      description: safeValue(fields.description),
      leadId: fields.leadId !== undefined ? (fields.leadId === null ? null : safeValue(fields.leadId)) : undefined,
      contactId: fields.contactId !== undefined ? (fields.contactId === null ? null : safeValue(fields.contactId)) : undefined,
      dealId: fields.dealId !== undefined ? (fields.dealId === null ? null : safeValue(fields.dealId)) : undefined,
      accountId: fields.accountId !== undefined ? (fields.accountId === null ? null : safeValue(fields.accountId)) : undefined,
    };
  }

  private mapResponseDtoToProto(dto: any): ActivityResponse {
    return {
      id: dto.id,
      activityType: dto.activityType,
      subject: dto.subject,
      meetingDateTime: dto.meetingDateTime?.toISOString() || new Date().toISOString(),
      duration: dto.duration?.toISOString() || new Date().toISOString(),
      outcome: dto.outcome ?? undefined,
      status: dto.status,
      description: dto.description ?? undefined,
      createdBy: dto.createdBy,
      createdAt: dto.createdAt?.toISOString() || new Date().toISOString(),
      leadId: dto.leadId ?? undefined,
      contactId: dto.contactId ?? undefined,
      dealId: dto.dealId ?? undefined,
      accountId: dto.accountId ?? undefined,
      lead: dto.lead ? {
        id: dto.lead.id,
        firstName: dto.lead.first_name,
        lastName: dto.lead.last_name,
      } : undefined,
      contact: dto.contact ? {
        id: dto.contact.id,
        firstName: dto.contact.first_name,
        lastName: dto.contact.last_name,
      } : undefined,
      deal: dto.deal ? {
        id: dto.deal.id,
        name: dto.deal.name,
      } : undefined,
      account: dto.account ? {
        id: dto.account.id,
        name: dto.account.name,
        accountNumber: dto.account.accountNumber,
      } : undefined,
    };
  }
}
