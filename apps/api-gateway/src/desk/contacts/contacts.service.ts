import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import type {
  PaginationRequest,
  FindOneContactRequest,
  ContactResponse,
  PaginatedContactsResponse,
} from '@app/common/types/contacts';
import { PaginationQueryDto } from './dto/pagination.dto';
import { ContactResponseDto } from './dto/contact-response.dto';

interface ContactsGrpcService {
  findAllContacts(data: PaginationRequest): Observable<PaginatedContactsResponse>;
  findOneContact(data: FindOneContactRequest): Observable<ContactResponse>;
}

export interface PaginatedContactsResult {
  data: ContactResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class ContactsService implements OnModuleInit {
  private contactsGrpcService: ContactsGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.contactsGrpcService = this.client.getService<ContactsGrpcService>('ContactsService');
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllContacts (API Gateway Desk):
   * 1. HTTP GET /desk/contacts?page=1&limit=10 with JWT token in Authorization header
   * 2. Controller receives PaginationQueryDto from query params
   * 3. This service method maps DTO to proto PaginationRequest
   * 4. Calls CRM microservice via gRPC: ContactsService.FindAllContacts(request)
   * 5. Receives proto PaginatedContactsResponse from CRM
   * 6. Maps proto responses to ContactResponseDto[] and pagination metadata
   * 7. Returns Observable<PaginatedContactsResult> to controller
   * 8. Controller returns HTTP 200 with paginated response
   */
  findAllContacts(paginationQuery: PaginationQueryDto): Observable<PaginatedContactsResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.contactsGrpcService.findAllContacts(request).pipe(
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
        console.error('Error fetching contacts from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindOneContact (API Gateway Desk):
   * 1. HTTP GET /desk/contacts/:id with JWT token in Authorization header
   * 2. Controller receives id from route params
   * 3. This service method maps id to proto FindOneContactRequest
   * 4. Calls CRM microservice via gRPC: ContactsService.FindOneContact(request)
   * 5. Receives proto ContactResponse from CRM
   * 6. Maps proto response to ContactResponseDto
   * 7. Returns Observable<ContactResponseDto> to controller
   * 8. Controller returns HTTP 200 with contact data
   */
  findOneContact(id: string): Observable<ContactResponseDto> {
    const request: FindOneContactRequest = { id };
    return this.contactsGrpcService.findOneContact(request).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error fetching contact from CRM microservice:', error);
        return throwError(() => error);
      })
    );
  }

  private mapResponseToDto(response: ContactResponse): ContactResponseDto {
    return {
      id: response.id,
      salutation: response.salutation ?? null,
      first_name: response.firstName,
      last_name: response.lastName,
      email: response.email,
      phone: response.phone ?? null,
      mobile_phone: response.mobilePhone ?? null,
      department: response.department ?? null,
      government_code: response.governmentCode ?? null,
      territory: response.territory ?? null,
      secondary_phone: response.secondaryPhone ?? null,
      assistant_name: response.assistantName ?? null,
      currency_code: response.currencyCode ?? null,
      username: response.username ?? null,
      wp_number: response.wpNumber ?? null,
      box_folder_id: response.boxFolderId ?? null,
      assigned_profile: response.assignedProfile ?? null,
      user_permissions: response.userPermissions ?? null,
      mailing_street: response.mailingStreet ?? null,
      mailing_city: response.mailingCity ?? null,
      mailing_state: response.mailingState ?? null,
      mailing_zip: response.mailingZip ?? null,
      mailing_country: response.mailingCountry ?? null,
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

