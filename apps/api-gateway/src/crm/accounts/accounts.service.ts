import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateAccountRequest,
  UpdateAccountRequest,
  PaginationRequest,
  FindOneAccountRequest,
  DeleteAccountRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  AccountResponse,
  PaginatedAccountsResponse,
  DeleteAccountResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/accounts';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateAccountDto } from './dto/bulk-update.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface AccountsGrpcService {
  createAccount(data: CreateAccountRequest, metadata?: Metadata): Observable<AccountResponse>;
  findAllAccounts(data: PaginationRequest): Observable<PaginatedAccountsResponse>;
  findOneAccount(data: FindOneAccountRequest): Observable<AccountResponse>;
  updateAccount(data: UpdateAccountRequest, metadata?: Metadata): Observable<AccountResponse>;
  deleteAccount(data: DeleteAccountRequest): Observable<DeleteAccountResponse>;
  bulkDeleteAccounts(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateAccounts(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedAccountsResult {
  data: AccountResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class AccountsService implements OnModuleInit {
  private accountsGrpcService: AccountsGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.accountsGrpcService = this.client.getService<AccountsGrpcService>('AccountsService');
  }

  /**
   * REQUEST/RESPONSE CYCLE - CreateAccount (API Gateway):
   * 1. HTTP POST /accounts with CreateAccountDto body + JWT token in Authorization header
   * 2. Controller extracts user from JWT token
   * 3. This service method maps DTO to proto CreateAccountRequest
   * 4. Creates gRPC metadata with user context (user-id, user-name, user-email)
   * 5. Calls CRM microservice via gRPC: AccountsService.CreateAccount(request, metadata)
   * 6. Receives proto AccountResponse from CRM
   * 7. Maps proto response to AccountResponseDto
   * 8. Returns Observable<AccountResponseDto> to controller
   * 9. Controller returns HTTP 201 with response body
   */
  createAccount(createAccountDto: CreateAccountDto, currentUser: { id: string; name: string; email: string }): Observable<AccountResponseDto> {
    const request: CreateAccountRequest = this.mapCreateDtoToRequest(createAccountDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.accountsGrpcService.createAccount(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createAccount gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllAccounts (API Gateway):
   * 1. HTTP GET /accounts?page=1&limit=10 with JWT token in Authorization header
   * 2. Controller receives PaginationQueryDto from query params
   * 3. This service method maps DTO to proto PaginationRequest
   * 4. Calls CRM microservice via gRPC: AccountsService.FindAllAccounts(request)
   * 5. Receives proto PaginatedAccountsResponse from CRM
   * 6. Maps proto responses to AccountResponseDto[] and pagination metadata
   * 7. Returns Observable<PaginatedAccountsResult> to controller
   * 8. Controller returns HTTP 200 with paginated response
   */
  findAllAccounts(paginationQuery: PaginationQueryDto): Observable<PaginatedAccountsResult> {
    // Ensure page and limit are numbers
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.accountsGrpcService.findAllAccounts(request).pipe(
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
        console.error('Error fetching accounts from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneAccount(id: string): Observable<AccountResponseDto> {
    const request: FindOneAccountRequest = { id };
    return this.accountsGrpcService.findOneAccount(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - UpdateAccount (API Gateway):
   * 1. HTTP PATCH /accounts/:id with UpdateAccountDto in request body + JWT token
   * 2. Controller extracts user from JWT token and id from route params
   * 3. This service method maps DTO to proto UpdateAccountRequest
   * 4. Creates gRPC metadata with user context
   * 5. Calls CRM microservice via gRPC: AccountsService.UpdateAccount(request, metadata)
   * 6. Receives proto AccountResponse from CRM
   * 7. Maps proto response to AccountResponseDto
   * 8. Returns Observable<AccountResponseDto> to controller
   * 9. Controller returns HTTP 200 with updated account
   */
  updateAccount(id: string, updateAccountDto: UpdateAccountDto, currentUser: { id: string; name: string; email: string }): Observable<AccountResponseDto> {
    const request: UpdateAccountRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateAccountDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.accountsGrpcService.updateAccount(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteAccountRequest = { id };
    return this.accountsGrpcService.deleteAccount(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.accountsGrpcService.bulkDeleteAccounts(request).pipe(
      map(response => ({
        deletedCount: response.deletedCount,
        failedIds: response.failedIds || [],
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateAccountDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      updateFields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.accountsGrpcService.bulkUpdateAccounts(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updatedCount,
        failedItems: response.failedItems || [],
      }))
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    const metadata = new Metadata();
    metadata.add('user-id', user.id);
    metadata.add('user-name', user.name);
    metadata.add('user-email', user.email);
    return metadata;
  }

  private mapCreateDtoToRequest(dto: CreateAccountDto): CreateAccountRequest {
    // Helper function to convert null/undefined to empty string for strings
    const safeString = (value: string | null | undefined): string => {
      return value !== null && value !== undefined ? String(value) : '';
    };

    const request: CreateAccountRequest = {
      // Required fields
      name: safeString(dto.name),
      phone: safeString(dto.phone),
      userIds: dto.userIds || [],
      
      // Optional fields
      accountNumber: dto.accountNumber !== undefined ? safeString(dto.accountNumber) : undefined,
      website: dto.website !== undefined ? safeString(dto.website) : undefined,
      billingStreet: dto.billing_street !== undefined ? safeString(dto.billing_street) : undefined,
      billingCity: dto.billing_city !== undefined ? safeString(dto.billing_city) : undefined,
      billingState: dto.billing_state !== undefined ? safeString(dto.billing_state) : undefined,
      billingZip: dto.billing_zip !== undefined ? safeString(dto.billing_zip) : undefined,
      billingCountry: dto.billing_country !== undefined ? safeString(dto.billing_country) : undefined,
      shippingStreet: dto.shipping_street !== undefined ? safeString(dto.shipping_street) : undefined,
      shippingCity: dto.shipping_city !== undefined ? safeString(dto.shipping_city) : undefined,
      shippingState: dto.shipping_state !== undefined ? safeString(dto.shipping_state) : undefined,
      shippingZip: dto.shipping_zip !== undefined ? safeString(dto.shipping_zip) : undefined,
      shippingCountry: dto.shipping_country !== undefined ? safeString(dto.shipping_country) : undefined,
      territory: dto.territory !== undefined ? safeString(dto.territory) : undefined,
      industry: dto.industry !== undefined ? safeString(dto.industry) : undefined,
      accountType: dto.accountType !== undefined ? safeString(dto.accountType) : undefined,
      ownership: dto.ownership !== undefined ? safeString(dto.ownership) : undefined,
      parentAccountId: dto.parentAccountId !== undefined ? safeString(dto.parentAccountId) : undefined,
    };

    return request;
  }

  private mapUpdateDtoToRequest(dto: UpdateAccountDto | Partial<UpdateAccountDto>): Partial<UpdateAccountRequest> {
    // Helper function to convert null/undefined to undefined for optional fields
    const safeString = (value: string | null | undefined): string | undefined => {
      return value !== null && value !== undefined ? String(value) : undefined;
    };

    const request: Partial<UpdateAccountRequest> = {};

    if (dto.name !== undefined) request.name = safeString(dto.name);
    if (dto.phone !== undefined) request.phone = safeString(dto.phone);
    if (dto.website !== undefined) request.website = safeString(dto.website);
    if (dto.billing_street !== undefined) request.billingStreet = safeString(dto.billing_street);
    if (dto.billing_city !== undefined) request.billingCity = safeString(dto.billing_city);
    if (dto.billing_state !== undefined) request.billingState = safeString(dto.billing_state);
    if (dto.billing_zip !== undefined) request.billingZip = safeString(dto.billing_zip);
    if (dto.billing_country !== undefined) request.billingCountry = safeString(dto.billing_country);
    if (dto.shipping_street !== undefined) request.shippingStreet = safeString(dto.shipping_street);
    if (dto.shipping_city !== undefined) request.shippingCity = safeString(dto.shipping_city);
    if (dto.shipping_state !== undefined) request.shippingState = safeString(dto.shipping_state);
    if (dto.shipping_zip !== undefined) request.shippingZip = safeString(dto.shipping_zip);
    if (dto.shipping_country !== undefined) request.shippingCountry = safeString(dto.shipping_country);
    if (dto.territory !== undefined) request.territory = safeString(dto.territory);
    if (dto.industry !== undefined) request.industry = safeString(dto.industry);
    if (dto.accountType !== undefined) request.accountType = safeString(dto.accountType);
    if (dto.ownership !== undefined) request.ownership = safeString(dto.ownership);
    if (dto.userIds !== undefined) request.userIds = dto.userIds;
    if (dto.parentAccountId !== undefined) request.parentAccountId = safeString(dto.parentAccountId);

    return request;
  }

  private mapResponseToDto(response: AccountResponse): AccountResponseDto {
    return {
      id: response.id,
      name: response.name,
      accountNumber: response.accountNumber,
      phone: response.phone ?? null,
      website: response.website ?? null,
      billing_street: response.billingStreet,
      billing_city: response.billingCity,
      billing_state: response.billingState ?? null,
      billing_zip: response.billingZip ?? null,
      billing_country: response.billingCountry ?? null,
      shipping_street: response.shippingStreet ?? null,
      shipping_city: response.shippingCity ?? null,
      shipping_state: response.shippingState ?? null,
      shipping_zip: response.shippingZip ?? null,
      shipping_country: response.shippingCountry ?? null,
      territory: response.territory ?? null,
      industry: response.industry ?? null,
      accountType: response.accountType ?? null,
      ownership: response.ownership ?? null,
      parentAccountId: response.parentAccountId ?? null,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      Users: (response.users || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email ?? null,
      })),
      Contacts: (response.contacts || []).map(contact => ({
        id: contact.id,
        first_name: contact.firstName,
        last_name: contact.lastName,
      })),
      Leads: (response.leads || []).map(lead => ({
        id: lead.id,
        first_name: lead.firstName,
        last_name: lead.lastName,
      })),
      Deals: (response.deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
      })),
      Created_by: response.createdBy,
      Modified_by: response.modifiedBy,
      parent_accounts: response.parentAccount ? {
        id: response.parentAccount.id,
        name: response.parentAccount.name,
        accountNumber: response.parentAccount.accountNumber,
      } : null,
    };
  }
}

