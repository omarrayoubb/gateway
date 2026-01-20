import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
import { ActivityResponseDto } from './dto/activity-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface ActivitiesGrpcService {
  createActivity(data: CreateActivityRequest, metadata?: Metadata): Observable<ActivityResponse>;
  findAllActivities(data: PaginationRequest): Observable<PaginatedActivitiesResponse>;
  findOneActivity(data: FindOneActivityRequest): Observable<ActivityResponse>;
  updateActivity(data: UpdateActivityRequest, metadata?: Metadata): Observable<ActivityResponse>;
  deleteActivity(data: DeleteActivityRequest): Observable<DeleteActivityResponse>;
  bulkDeleteActivities(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateActivities(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedActivitiesResult {
  data: ActivityResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class ActivitiesService implements OnModuleInit {
  private activitiesGrpcService: ActivitiesGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.activitiesGrpcService = this.client.getService<ActivitiesGrpcService>('ActivitiesService');
  }

  createActivity(createActivityDto: CreateActivityDto, currentUser: { id: string; name: string; email: string }): Observable<ActivityResponseDto> {
    const request: CreateActivityRequest = this.mapCreateDtoToRequest(createActivityDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.activitiesGrpcService.createActivity(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createActivity gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllActivities(paginationQuery: PaginationQueryDto): Observable<PaginatedActivitiesResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.activitiesGrpcService.findAllActivities(request).pipe(
      map(response => {
        if (!response) {
          throw new Error('Empty response from CRM microservice');
        }
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response structure from CRM:', JSON.stringify(response, null, 2));
          return {
            data: [],
            total: response.total || 0,
            page: response.page || page,
            last_page: response.lastPage || 0,
          };
        }
        return {
          data: response.data.map(item => this.mapResponseToDto(item)),
          total: response.total || 0,
          page: response.page || page,
          last_page: response.lastPage || 0,
        };
      }),
      catchError(error => {
        console.error('Error fetching activities from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneActivity(id: string): Observable<ActivityResponseDto> {
    const request: FindOneActivityRequest = { id };
    return this.activitiesGrpcService.findOneActivity(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateActivity(id: string, updateActivityDto: UpdateActivityDto, currentUser: { id: string; name: string; email: string }): Observable<ActivityResponseDto> {
    const request: UpdateActivityRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateActivityDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.activitiesGrpcService.updateActivity(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteActivityRequest = { id };
    return this.activitiesGrpcService.deleteActivity(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.activitiesGrpcService.bulkDeleteActivities(request).pipe(
      map(response => ({
        deletedCount: response.deletedCount,
        failedIds: response.failedIds || [],
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateActivityDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      updateFields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.activitiesGrpcService.bulkUpdateActivities(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updatedCount,
        failedItems: response.failedItems || [],
      }))
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    // Handle undefined user
    const safeUser = user || { id: 'system', name: 'System User', email: 'system@example.com' };
    const metadata = new Metadata();
    metadata.add('user-id', safeUser.id);
    metadata.add('user-name', safeUser.name);
    metadata.add('user-email', safeUser.email);
    return metadata;
  }

  private mapCreateDtoToRequest(dto: CreateActivityDto): CreateActivityRequest {
    const safeString = (value: string | null | undefined): string => {
      return value !== null && value !== undefined ? String(value) : '';
    };

    return {
      activityType: safeString(dto.activityType),
      subject: safeString(dto.subject),
      meetingDateTime: safeString(dto.meetingDateTime),
      duration: safeString(dto.duration),
      status: safeString(dto.status),
      leadId: dto.leadId !== undefined ? safeString(dto.leadId) : undefined,
      contactId: dto.contactId !== undefined ? safeString(dto.contactId) : undefined,
      dealId: dto.dealId !== undefined ? safeString(dto.dealId) : undefined,
      accountId: dto.accountId !== undefined ? safeString(dto.accountId) : undefined,
      outcome: dto.outcome !== undefined ? safeString(dto.outcome) : undefined,
      description: dto.description !== undefined ? safeString(dto.description) : undefined,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateActivityDto | Partial<UpdateActivityDto>): Partial<UpdateActivityRequest> {
    const safeString = (value: string | null | undefined): string | undefined => {
      return value !== null && value !== undefined ? String(value) : undefined;
    };

    const request: Partial<UpdateActivityRequest> = {};

    if (dto.activityType !== undefined) request.activityType = safeString(dto.activityType);
    if (dto.subject !== undefined) request.subject = safeString(dto.subject);
    if (dto.meetingDateTime !== undefined) request.meetingDateTime = safeString(dto.meetingDateTime);
    if (dto.duration !== undefined) request.duration = safeString(dto.duration);
    if (dto.status !== undefined) request.status = safeString(dto.status);
    if (dto.outcome !== undefined) request.outcome = safeString(dto.outcome);
    if (dto.description !== undefined) request.description = safeString(dto.description);
    if (dto.leadId !== undefined) request.leadId = dto.leadId === null ? null : safeString(dto.leadId);
    if (dto.contactId !== undefined) request.contactId = dto.contactId === null ? null : safeString(dto.contactId);
    if (dto.dealId !== undefined) request.dealId = dto.dealId === null ? null : safeString(dto.dealId);
    if (dto.accountId !== undefined) request.accountId = dto.accountId === null ? null : safeString(dto.accountId);

    return request;
  }

  private mapResponseToDto(response: ActivityResponse): ActivityResponseDto {
    return {
      id: response.id,
      activityType: response.activityType,
      subject: response.subject,
      meetingDateTime: new Date(response.meetingDateTime),
      duration: new Date(response.duration),
      outcome: response.outcome ?? null,
      status: response.status,
      description: response.description ?? null,
      createdBy: response.createdBy,
      createdAt: new Date(response.createdAt),
      leadId: response.leadId ?? null,
      contactId: response.contactId ?? null,
      dealId: response.dealId ?? null,
      accountId: response.accountId ?? null,
      lead: response.lead ? {
        id: response.lead.id,
        first_name: response.lead.firstName,
        last_name: response.lead.lastName,
      } : null,
      contact: response.contact ? {
        id: response.contact.id,
        first_name: response.contact.firstName,
        last_name: response.contact.lastName,
      } : null,
      deal: response.deal ? {
        id: response.deal.id,
        name: response.deal.name,
      } : null,
      account: response.account ? {
        id: response.account.id,
        name: response.account.name,
        accountNumber: response.account.accountNumber,
      } : null,
    };
  }
}

