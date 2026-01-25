import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateLeadRequest,
  UpdateLeadRequest,
  PaginationRequest,
  FindOneLeadRequest,
  DeleteLeadRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  LeadResponse,
  PaginatedLeadsResponse,
  DeleteLeadResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/leads';
import { CreateLeadDto } from './dto/create-lead.dto copy';
import { UpdateLeadDto } from './dto/update-lead.dto copy';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateLeadDto } from './dto/bulk-update.dto';
import { LeadResponseDto } from './dto/lead-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface LeadsGrpcService {
  createLead(data: CreateLeadRequest, metadata?: Metadata): Observable<LeadResponse>;
  findAllLeads(data: PaginationRequest): Observable<PaginatedLeadsResponse>;
  findOneLead(data: FindOneLeadRequest): Observable<LeadResponse>;
  updateLead(data: UpdateLeadRequest, metadata?: Metadata): Observable<LeadResponse>;
  deleteLead(data: DeleteLeadRequest): Observable<DeleteLeadResponse>;
  bulkDeleteLeads(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateLeads(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedLeadsResult {
    data: LeadResponseDto[];
    total: number;
    page: number;
    last_page: number; // <--- Correct
  }

@Injectable()
export class LeadsService implements OnModuleInit {
  private leadsGrpcService: LeadsGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.leadsGrpcService = this.client.getService<LeadsGrpcService>('LeadsService');
  }

  /**
   * REQUEST/RESPONSE CYCLE - CreateLead (API Gateway):
   * 1. HTTP POST /leads with CreateLeadDto body + JWT token in Authorization header
   * 2. Controller extracts user from JWT token
   * 3. This service method maps DTO to proto CreateLeadRequest
   * 4. Creates gRPC metadata with user context (user-id, user-name, user-email)
   * 5. Calls CRM microservice via gRPC: LeadsService.CreateLead(request, metadata)
   * 6. Receives proto LeadResponse from CRM
   * 7. Maps proto response to LeadResponseDto
   * 8. Returns Observable<LeadResponseDto> to controller
   * 9. Controller returns HTTP 201 with response body
   */
  createLead(createLeadDto: CreateLeadDto, currentUser: { id: string; name: string; email: string }): Observable<LeadResponseDto> {
    const request: CreateLeadRequest = this.mapCreateDtoToRequest(createLeadDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.leadsGrpcService.createLead(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllLeads (API Gateway):
   * 1. HTTP GET /leads?page=1&limit=10 with JWT token in Authorization header
   * 2. Controller receives PaginationQueryDto from query params
   * 3. This service method maps DTO to proto PaginationRequest
   * 4. Calls CRM microservice via gRPC: LeadsService.FindAllLeads(request)
   * 5. Receives proto PaginatedLeadsResponse from CRM
   * 6. Maps proto responses to LeadResponseDto[] and pagination metadata
   * 7. Returns Observable<PaginatedLeadsResult> to controller
   * 8. Controller returns HTTP 200 with paginated response
   */
  findAllLeads(paginationQuery: PaginationQueryDto): Observable<PaginatedLeadsResult> {
    // Ensure page and limit are numbers
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.leadsGrpcService.findAllLeads(request).pipe(
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
    );
  }

  findOneLead(id: string): Observable<LeadResponseDto> {
    const request: FindOneLeadRequest = { id };
    return this.leadsGrpcService.findOneLead(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - UpdateLead (API Gateway):
   * 1. HTTP PATCH /leads/:id with UpdateLeadDto in request body + JWT token
   * 2. Controller extracts user from JWT token and id from route params
   * 3. This service method maps DTO to proto UpdateLeadRequest
   * 4. Creates gRPC metadata with user context
   * 5. Calls CRM microservice via gRPC: LeadsService.UpdateLead(request, metadata)
   * 6. Receives proto LeadResponse from CRM
   * 7. Maps proto response to LeadResponseDto
   * 8. Returns Observable<LeadResponseDto> to controller
   * 9. Controller returns HTTP 200 with updated lead
   */
  updateLead(id: string, updateLeadDto: UpdateLeadDto, currentUser: { id: string; name: string; email: string }): Observable<LeadResponseDto> {
    const request: UpdateLeadRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateLeadDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.leadsGrpcService.updateLead(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteLeadRequest = { id };
    return this.leadsGrpcService.deleteLead(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.leadsGrpcService.bulkDeleteLeads(request).pipe(
      map(response => ({
        deletedCount: response.deletedCount,
        failedIds: response.failedIds,
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateLeadDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      updateFields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.leadsGrpcService.bulkUpdateLeads(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updatedCount,
        failedItems: response.failedItems,
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

  private mapCreateDtoToRequest(dto: CreateLeadDto): CreateLeadRequest {
    // Helper function to convert null/undefined to empty string for strings
    const safeString = (value: string | null | undefined): string => {
      return value !== null && value !== undefined ? String(value) : '';
    };

    // Helper function to convert null/undefined to 0 for numbers
    const safeNumber = (value: number | null | undefined): number => {
      return value !== null && value !== undefined ? Number(value) : 0;
    };

    // Required fields - always include, convert null/undefined to empty strings
    // ALL fields must have non-null values for proper gRPC serialization
    const request: CreateLeadRequest = {
      // Required fields (fields 1-6)
      firstName: safeString(dto.first_name),
      lastName: safeString(dto.last_name),
      phone: safeString(dto.phone),
      email: safeString(dto.email),
      shippingStreet: safeString(dto.shipping_street),
      billingCity: safeString(dto.billing_city),
      
      // Optional fields (fields 7-24) - ALWAYS include with safe defaults (empty string or 0)
      // This ensures gRPC serializes all fields with non-null values
      ownerId: safeString(dto.ownerId),
      salutation: safeString(dto.salutation),
      accountId: safeString(dto.accountId),
      productName: safeString(dto.product_name),
      currencyCode: safeString(dto.currency_code),
      employeeCount: safeNumber(dto.employee_count),
      hqCode: safeString(dto.hq_code),
      billingAmount: safeNumber(dto.billing_amount),
      exchangeRate: safeNumber(dto.exchange_rate),
      shippingStreet2: safeString(dto.shipping_street_2),
      shippingCity: safeString(dto.shipping_city),
      shippingState: safeString(dto.shipping_state),
      shippingCountry: safeString(dto.shipping_country),
      shippingZipCode: safeString(dto.shipping_zip_code),
      billingStreet: safeString(dto.billing_street),
      billingStreet2: safeString(dto.billing_street_2),
      billingState: safeString(dto.billing_state),
      billingCountry: safeString(dto.billing_country),
      billingZipCode: safeString(dto.billing_zip_code),
    };

    return request;
  }

  private mapUpdateDtoToRequest(dto: UpdateLeadDto | Partial<UpdateLeadDto>): Partial<UpdateLeadRequest> {
    // Helper function to convert null/undefined to empty string for strings
    const safeString = (value: string | null | undefined): string | undefined => {
      return value !== null && value !== undefined ? String(value) : undefined;
    };

    // Helper function to convert null/undefined to 0 for numbers
    const safeNumber = (value: number | null | undefined): number | undefined => {
      return value !== null && value !== undefined ? Number(value) : undefined;
    };

    const request: Partial<UpdateLeadRequest> = {};

    if (dto.salutation !== undefined) request.salutation = safeString(dto.salutation);
    if (dto.first_name !== undefined) request.firstName = safeString(dto.first_name);
    if (dto.last_name !== undefined) request.lastName = safeString(dto.last_name);
    if (dto.phone !== undefined) request.phone = safeString(dto.phone);
    if (dto.email !== undefined) request.email = safeString(dto.email);
    if (dto.shipping_street !== undefined) request.shippingStreet = safeString(dto.shipping_street);
    if (dto.billing_city !== undefined) request.billingCity = safeString(dto.billing_city);
    if (dto.accountId !== undefined) request.accountId = safeString(dto.accountId);
    if (dto.product_name !== undefined) request.productName = safeString(dto.product_name);
    if (dto.currency_code !== undefined) request.currencyCode = safeString(dto.currency_code);
    if (dto.employee_count !== undefined) request.employeeCount = safeNumber(dto.employee_count);
    if (dto.hq_code !== undefined) request.hqCode = safeString(dto.hq_code);
    if (dto.billing_amount !== undefined) request.billingAmount = safeNumber(dto.billing_amount);
    if (dto.exchange_rate !== undefined) request.exchangeRate = safeNumber(dto.exchange_rate);
    if (dto.shipping_street_2 !== undefined) request.shippingStreet2 = safeString(dto.shipping_street_2);
    if (dto.shipping_city !== undefined) request.shippingCity = safeString(dto.shipping_city);
    if (dto.shipping_state !== undefined) request.shippingState = safeString(dto.shipping_state);
    if (dto.shipping_country !== undefined) request.shippingCountry = safeString(dto.shipping_country);
    if (dto.shipping_zip_code !== undefined) request.shippingZipCode = safeString(dto.shipping_zip_code);
    if (dto.billing_street !== undefined) request.billingStreet = safeString(dto.billing_street);
    if (dto.billing_street_2 !== undefined) request.billingStreet2 = safeString(dto.billing_street_2);
    if (dto.billing_state !== undefined) request.billingState = safeString(dto.billing_state);
    if (dto.billing_country !== undefined) request.billingCountry = safeString(dto.billing_country);
    if (dto.billing_zip_code !== undefined) request.billingZipCode = safeString(dto.billing_zip_code);
    if (dto.ownerId !== undefined) request.ownerId = safeString(dto.ownerId);

    return request;
  }

  private mapResponseToDto(response: LeadResponse): LeadResponseDto {
    return {
      id: response.id,
      salutation: response.salutation ?? null,
      first_name: response.firstName,
      last_name: response.lastName,
      phone: response.phone,
      email: response.email,
      shipping_street: response.shippingStreet,
      billing_city: response.billingCity,
      product_name: response.productName ?? null,
      currency_code: response.currencyCode ?? null,
      employee_count: response.employeeCount ?? null,
      hq_code: response.hqCode ?? null,
      billing_amount: response.billingAmount ?? null,
      exchange_rate: response.exchangeRate ?? null,
      shipping_street_2: response.shippingStreet2 ?? null,
      shipping_city: response.shippingCity ?? null,
      shipping_state: response.shippingState ?? null,
      shipping_country: response.shippingCountry ?? null,
      shipping_zip_code: response.shippingZipCode ?? null,
      billing_street: response.billingStreet ?? null,
      billing_street_2: response.billingStreet2 ?? null,
      billing_state: response.billingState ?? null,
      billing_country: response.billingCountry ?? null,
      billing_zip_code: response.billingZipCode ?? null,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      OwnerData: response.ownerData ? {
        id: response.ownerData.id,
        firstName: response.ownerData.firstName,
        lastName: response.ownerData.lastName,
      } : null,
      Created_by: response.createdBy,
      Modified_by: response.modifiedBy,
      Account_details: response.accountDetails ? {
        id: response.accountDetails.id,
        name: response.accountDetails.name,
        accountNumber: response.accountDetails.accountNumber,
      } : null,
      Deals: (response.deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
      })),
      Activities: (response.activities || []).map(activity => ({
        id: activity.id,
        activityType: activity.activityType,
        subject: activity.subject,
      })),
    };
  }
}
