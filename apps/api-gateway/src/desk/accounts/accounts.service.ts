import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import type {
  PaginationRequest,
  FindOneAccountRequest,
  AccountResponse,
  PaginatedAccountsResponse,
} from '@app/common/types/accounts';
import { PaginationQueryDto } from './dto/pagination.dto';
import { AccountResponseDto } from './dto/account-response.dto';

interface AccountsGrpcService {
  findAllAccounts(data: PaginationRequest): Observable<PaginatedAccountsResponse>;
  findOneAccount(data: FindOneAccountRequest): Observable<AccountResponse>;
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
   * REQUEST/RESPONSE CYCLE - FindAllAccounts (API Gateway Desk):
   * 1. HTTP GET /desk/accounts?page=1&limit=10 with JWT token in Authorization header
   * 2. Controller receives PaginationQueryDto from query params
   * 3. This service method maps DTO to proto PaginationRequest
   * 4. Calls CRM microservice via gRPC: AccountsService.FindAllAccounts(request)
   * 5. Receives proto PaginatedAccountsResponse from CRM
   * 6. Maps proto responses to AccountResponseDto[] and pagination metadata
   * 7. Returns Observable<PaginatedAccountsResult> to controller
   * 8. Controller returns HTTP 200 with paginated response
   */
  findAllAccounts(paginationQuery: PaginationQueryDto): Observable<PaginatedAccountsResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.accountsGrpcService.findAllAccounts(request).pipe(
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
        console.error('Error fetching accounts from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindOneAccount (API Gateway Desk):
   * 1. HTTP GET /desk/accounts/:id with JWT token in Authorization header
   * 2. Controller receives id from route params
   * 3. This service method maps id to proto FindOneAccountRequest
   * 4. Calls CRM microservice via gRPC: AccountsService.FindOneAccount(request)
   * 5. Receives proto AccountResponse from CRM
   * 6. Maps proto response to AccountResponseDto
   * 7. Returns Observable<AccountResponseDto> to controller
   * 8. Controller returns HTTP 200 with account data
   */
  findOneAccount(id: string): Observable<AccountResponseDto> {
    const request: FindOneAccountRequest = { id };
    return this.accountsGrpcService.findOneAccount(request).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error fetching account from CRM microservice:', error);
        return throwError(() => error);
      })
    );
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


















