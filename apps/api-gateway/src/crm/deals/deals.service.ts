import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateDealRequest,
  UpdateDealRequest,
  PaginationRequest,
  FindOneDealRequest,
  DeleteDealRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  DealResponse,
  PaginatedDealsResponse,
  DeleteDealResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/deals';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateDealDto } from './dto/bulk-update.dto';
import { DealResponseDto } from './dto/deal-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface DealsGrpcService {
  createDeal(data: CreateDealRequest, metadata?: Metadata): Observable<DealResponse>;
  findAllDeals(data: PaginationRequest): Observable<PaginatedDealsResponse>;
  findOneDeal(data: FindOneDealRequest): Observable<DealResponse>;
  updateDeal(data: UpdateDealRequest, metadata?: Metadata): Observable<DealResponse>;
  deleteDeal(data: DeleteDealRequest): Observable<DeleteDealResponse>;
  bulkDeleteDeals(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateDeals(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedDealsResult {
  data: DealResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class DealsService implements OnModuleInit {
  private dealsGrpcService: DealsGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.dealsGrpcService = this.client.getService<DealsGrpcService>('DealsService');
  }

  /**
   * REQUEST/RESPONSE CYCLE - CreateDeal (API Gateway):
   * 1. HTTP POST /deals with CreateDealDto body + JWT token in Authorization header
   * 2. Controller extracts user from JWT token
   * 3. This service method maps DTO to proto CreateDealRequest
   * 4. Creates gRPC metadata with user context (user-id, user-name, user-email)
   * 5. Calls CRM microservice via gRPC: DealsService.CreateDeal(request, metadata)
   * 6. Receives proto DealResponse from CRM
   * 7. Maps proto response to DealResponseDto
   * 8. Returns Observable<DealResponseDto> to controller
   * 9. Controller returns HTTP 201 with response body
   */
  createDeal(createDealDto: CreateDealDto, currentUser: { id: string; name: string; email: string }): Observable<DealResponseDto> {
    const request: CreateDealRequest = this.mapCreateDtoToRequest(createDealDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.dealsGrpcService.createDeal(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createDeal gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllDeals (API Gateway):
   * 1. HTTP GET /deals?page=1&limit=10 with JWT token in Authorization header
   * 2. Controller receives PaginationQueryDto from query params
   * 3. This service method maps DTO to proto PaginationRequest
   * 4. Calls CRM microservice via gRPC: DealsService.FindAllDeals(request)
   * 5. Receives proto PaginatedDealsResponse from CRM
   * 6. Maps proto responses to DealResponseDto[] and pagination metadata
   * 7. Returns Observable<PaginatedDealsResult> to controller
   * 8. Controller returns HTTP 200 with paginated response
   */
  findAllDeals(paginationQuery: PaginationQueryDto): Observable<PaginatedDealsResult> {
    // Ensure page and limit are numbers
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.dealsGrpcService.findAllDeals(request).pipe(
      map(response => {
        // Handle case where response or response.data is undefined/null
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
        console.error('Error fetching deals from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneDeal(id: string): Observable<DealResponseDto> {
    const request: FindOneDealRequest = { id };
    return this.dealsGrpcService.findOneDeal(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - UpdateDeal (API Gateway):
   * 1. HTTP PATCH /deals/:id with UpdateDealDto in request body + JWT token
   * 2. Controller extracts user from JWT token and id from route params
   * 3. This service method maps DTO to proto UpdateDealRequest
   * 4. Creates gRPC metadata with user context
   * 5. Calls CRM microservice via gRPC: DealsService.UpdateDeal(request, metadata)
   * 6. Receives proto DealResponse from CRM
   * 7. Maps proto response to DealResponseDto
   * 8. Returns Observable<DealResponseDto> to controller
   * 9. Controller returns HTTP 200 with updated deal
   */
  updateDeal(id: string, updateDealDto: UpdateDealDto, currentUser: { id: string; name: string; email: string }): Observable<DealResponseDto> {
    const request: UpdateDealRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateDealDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.dealsGrpcService.updateDeal(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteDealRequest = { id };
    return this.dealsGrpcService.deleteDeal(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.dealsGrpcService.bulkDeleteDeals(request).pipe(
      map(response => ({
        deletedCount: response.deletedCount,
        failedIds: response.failedIds || [],
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateDealDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      updateFields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.dealsGrpcService.bulkUpdateDeals(request, metadata).pipe(
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

  private mapCreateDtoToRequest(dto: CreateDealDto): CreateDealRequest {
    // Helper function to convert null/undefined to empty string for strings
    const safeString = (value: string | null | undefined): string => {
      return value !== null && value !== undefined ? String(value) : '';
    };

    // Helper function to convert null/undefined to 0 for numbers
    const safeNumber = (value: number | null | undefined): number => {
      return value !== null && value !== undefined ? Number(value) : 0;
    };

    // Helper function to convert Date to ISO string
    const safeDateString = (value: Date | string | null | undefined): string => {
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString();
      return String(value);
    };

    const request: CreateDealRequest = {
      // Required fields
      name: safeString(dto.name),
      accountId: safeString(dto.accountId),
      ownerId: safeString(dto.ownerId),
      
      // Optional fields
      leadId: dto.leadId !== undefined ? safeString(dto.leadId) : undefined,
      contactId: dto.contactId !== undefined ? safeString(dto.contactId) : undefined,
      amount: dto.amount !== undefined ? safeNumber(dto.amount) : undefined,
      closingDate: dto.closingDate !== undefined ? safeDateString(dto.closingDate) : undefined,
      currency: dto.currency !== undefined ? safeString(dto.currency) : undefined,
      type: dto.type !== undefined ? safeString(dto.type) : undefined,
      stage: dto.stage !== undefined ? safeString(dto.stage) : undefined,
      probability: dto.probability !== undefined ? safeNumber(dto.probability) : undefined,
      leadSource: dto.leadSource !== undefined ? safeString(dto.leadSource) : undefined,
      description: dto.description !== undefined ? safeString(dto.description) : undefined,
      boxFolderId: dto.boxFolderId !== undefined ? safeString(dto.boxFolderId) : undefined,
      campaignSource: dto.campaignSource !== undefined ? safeString(dto.campaignSource) : undefined,
      quote: dto.quote !== undefined ? safeString(dto.quote) : undefined,
    };

    return request;
  }

  private mapUpdateDtoToRequest(dto: UpdateDealDto | Partial<UpdateDealDto>): Partial<UpdateDealRequest> {
    // Helper function to convert null/undefined to undefined for optional fields
    const safeString = (value: string | null | undefined): string | undefined => {
      return value !== null && value !== undefined ? String(value) : undefined;
    };

    // Helper function to convert null/undefined to undefined for numbers
    const safeNumber = (value: number | null | undefined): number | undefined => {
      return value !== null && value !== undefined ? Number(value) : undefined;
    };

    // Helper function to convert Date to ISO string
    const safeDateString = (value: Date | string | null | undefined): string | undefined => {
      if (value === null || value === undefined) return undefined;
      if (value instanceof Date) return value.toISOString();
      return String(value);
    };

    const request: Partial<UpdateDealRequest> = {};

    if (dto.name !== undefined) request.name = safeString(dto.name);
    if (dto.accountId !== undefined) request.accountId = safeString(dto.accountId);
    if (dto.ownerId !== undefined) request.ownerId = safeString(dto.ownerId);
    if (dto.leadId !== undefined) request.leadId = dto.leadId !== null ? safeString(dto.leadId) : null;
    if (dto.contactId !== undefined) request.contactId = dto.contactId !== null ? safeString(dto.contactId) : null;
    if (dto.amount !== undefined) request.amount = safeNumber(dto.amount);
    if (dto.closingDate !== undefined) request.closingDate = safeDateString(dto.closingDate);
    if (dto.currency !== undefined) request.currency = safeString(dto.currency);
    if (dto.type !== undefined) request.type = safeString(dto.type);
    if (dto.stage !== undefined) request.stage = safeString(dto.stage);
    if (dto.probability !== undefined) request.probability = safeNumber(dto.probability);
    if (dto.leadSource !== undefined) request.leadSource = safeString(dto.leadSource);
    if (dto.description !== undefined) request.description = safeString(dto.description);
    if (dto.boxFolderId !== undefined) request.boxFolderId = safeString(dto.boxFolderId);
    if (dto.campaignSource !== undefined) request.campaignSource = safeString(dto.campaignSource);
    if (dto.quote !== undefined) request.quote = safeString(dto.quote);

    return request;
  }

  private mapResponseToDto(response: DealResponse): DealResponseDto {
    return {
      id: response.id,
      name: response.name,
      amount: response.amount ?? null,
      closingDate: response.closingDate ? new Date(response.closingDate) : null,
      currency: response.currency ?? null,
      type: response.type ?? null,
      stage: response.stage ?? null,
      probability: response.probability ?? null,
      leadSource: response.leadSource ?? null,
      description: response.description ?? null,
      boxFolderId: response.boxFolderId ?? null,
      campaignSource: response.campaignSource ?? null,
      quote: response.quote ?? null,
      ownerId: response.ownerId,
      accountId: response.accountId,
      leadId: response.leadId ?? null,
      contactId: response.contactId ?? null,
      createdBy: response.createdBy,
      modifiedBy: response.modifiedBy,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      Account: response.accountInfo ? {
        id: response.accountInfo.id,
        name: response.accountInfo.name,
      } : { id: '', name: '' },
      Lead: response.leadInfo ? {
        id: response.leadInfo.id,
        name: response.leadInfo.name,
      } : null,
      Contact: response.contactInfo ? {
        id: response.contactInfo.id,
        name: response.contactInfo.name,
      } : null,
      OwnerData: response.ownerData ? {
        id: response.ownerData.id,
        firstName: response.ownerData.firstName,
        lastName: response.ownerData.lastName,
      } : null,
    };
  }
}

