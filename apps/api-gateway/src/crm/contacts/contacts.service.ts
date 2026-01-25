import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateContactRequest,
  UpdateContactRequest,
  PaginationRequest,
  FindOneContactRequest,
  DeleteContactRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  ContactResponse,
  PaginatedContactsResponse,
  DeleteContactResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/contacts';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PaginationQueryDto } from '../leads/dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateContactDto } from './dto/bulk-update.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface ContactsGrpcService {
  createContact(data: CreateContactRequest, metadata?: Metadata): Observable<ContactResponse>;
  findAllContacts(data: PaginationRequest): Observable<PaginatedContactsResponse>;
  findOneContact(data: FindOneContactRequest): Observable<ContactResponse>;
  updateContact(data: UpdateContactRequest, metadata?: Metadata): Observable<ContactResponse>;
  deleteContact(data: DeleteContactRequest): Observable<DeleteContactResponse>;
  bulkDeleteContacts(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateContacts(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
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
   * REQUEST/RESPONSE CYCLE - CreateContact (API Gateway):
   * 1. HTTP POST /contacts with CreateContactDto body + JWT token in Authorization header
   * 2. Controller extracts user from JWT token
   * 3. This service method maps DTO to proto CreateContactRequest
   * 4. Creates gRPC metadata with user context (user-id, user-name, user-email)
   * 5. Calls CRM microservice via gRPC: ContactsService.CreateContact(request, metadata)
   * 6. Receives proto ContactResponse from CRM
   * 7. Maps proto response to ContactResponseDto
   * 8. Returns Observable<ContactResponseDto> to controller
   * 9. Controller returns HTTP 201 with response body
   */
  createContact(createContactDto: CreateContactDto, currentUser: { id: string; name: string; email: string }): Observable<ContactResponseDto> {
    const request: CreateContactRequest = this.mapCreateDtoToRequest(createContactDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.contactsGrpcService.createContact(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllContacts (API Gateway):
   * 1. HTTP GET /contacts?page=1&limit=10 with JWT token in Authorization header
   * 2. Controller receives PaginationQueryDto from query params
   * 3. This service method maps DTO to proto PaginationRequest
   * 4. Calls CRM microservice via gRPC: ContactsService.FindAllContacts(request)
   * 5. Receives proto PaginatedContactsResponse from CRM
   * 6. Maps proto responses to ContactResponseDto[] and pagination metadata
   * 7. Returns Observable<PaginatedContactsResult> to controller
   * 8. Controller returns HTTP 200 with paginated response
   */
  findAllContacts(paginationQuery: PaginationQueryDto): Observable<PaginatedContactsResult> {
    // Ensure page and limit are numbers
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.contactsGrpcService.findAllContacts(request).pipe(
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

  findOneContact(id: string): Observable<ContactResponseDto> {
    const request: FindOneContactRequest = { id };
    return this.contactsGrpcService.findOneContact(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  /**
   * REQUEST/RESPONSE CYCLE - UpdateContact (API Gateway):
   * 1. HTTP PATCH /contacts/:id with UpdateContactDto in request body + JWT token
   * 2. Controller extracts user from JWT token and id from route params
   * 3. This service method maps DTO to proto UpdateContactRequest
   * 4. Creates gRPC metadata with user context
   * 5. Calls CRM microservice via gRPC: ContactsService.UpdateContact(request, metadata)
   * 6. Receives proto ContactResponse from CRM
   * 7. Maps proto response to ContactResponseDto
   * 8. Returns Observable<ContactResponseDto> to controller
   * 9. Controller returns HTTP 200 with updated contact
   */
  updateContact(id: string, updateContactDto: UpdateContactDto, currentUser: { id: string; name: string; email: string }): Observable<ContactResponseDto> {
    const request: UpdateContactRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateContactDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.contactsGrpcService.updateContact(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteContactRequest = { id };
    return this.contactsGrpcService.deleteContact(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.contactsGrpcService.bulkDeleteContacts(request).pipe(
      map(response => ({
        deletedCount: response.deletedCount,
        failedIds: response.failedIds,
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateContactDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      updateFields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.contactsGrpcService.bulkUpdateContacts(request, metadata).pipe(
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

  private mapCreateDtoToRequest(dto: CreateContactDto): CreateContactRequest {
    // Helper function to convert null/undefined to empty string for strings
    const safeString = (value: string | null | undefined): string => {
      return value !== null && value !== undefined ? String(value) : '';
    };

    // Required fields - always include, convert null/undefined to empty strings
    const request: CreateContactRequest = {
      // Required fields
      firstName: safeString(dto.first_name),
      lastName: safeString(dto.last_name),
      email: safeString(dto.email),
      
      // Optional fields - ALWAYS include with safe defaults (empty string)
      salutation: safeString(dto.salutation),
      phone: safeString(dto.phone),
      mobilePhone: safeString(dto.mobile_phone),
      ownerId: safeString(dto.ownerId),
      accountId: safeString(dto.accountId),
      department: safeString(dto.department),
      governmentCode: safeString(dto.governmentCode),
      territory: safeString(dto.territory),
      secondaryPhone: safeString(dto.secondary_phone),
      assistantName: safeString(dto.assistant_name),
      currencyCode: safeString(dto.currency_code),
      username: safeString(dto.username),
      wpNumber: safeString(dto.wp_number),
      boxFolderId: safeString(dto.box_folder_id),
      assignedProfile: safeString(dto.assigned_profile),
      userPermissions: safeString(dto.user_permissions),
      mailingStreet: safeString(dto.mailing_street),
      mailingCity: safeString(dto.mailing_city),
      mailingState: safeString(dto.mailing_state),
      mailingZip: safeString(dto.mailing_zip),
      mailingCountry: safeString(dto.mailing_country),
    };

    return request;
  }

  private mapUpdateDtoToRequest(dto: UpdateContactDto | Partial<UpdateContactDto>): Partial<UpdateContactRequest> {
    // Helper function to convert null/undefined to undefined for optional fields
    const safeString = (value: string | null | undefined): string | undefined => {
      return value !== null && value !== undefined ? String(value) : undefined;
    };

    const request: Partial<UpdateContactRequest> = {};

    if (dto.salutation !== undefined) request.salutation = safeString(dto.salutation);
    if (dto.first_name !== undefined) request.firstName = safeString(dto.first_name);
    if (dto.last_name !== undefined) request.lastName = safeString(dto.last_name);
    if (dto.phone !== undefined) request.phone = safeString(dto.phone);
    if (dto.mobile_phone !== undefined) request.mobilePhone = safeString(dto.mobile_phone);
    if ('accountId' in dto && dto.accountId !== undefined) request.accountId = safeString(dto.accountId);
    if (dto.department !== undefined) request.department = safeString(dto.department);
    if (dto.governmentCode !== undefined) request.governmentCode = safeString(dto.governmentCode);
    if (dto.territory !== undefined) request.territory = safeString(dto.territory);
    if (dto.secondary_phone !== undefined) request.secondaryPhone = safeString(dto.secondary_phone);
    if (dto.assistant_name !== undefined) request.assistantName = safeString(dto.assistant_name);
    if (dto.currency_code !== undefined) request.currencyCode = safeString(dto.currency_code);
    if (dto.username !== undefined) request.username = safeString(dto.username);
    if (dto.wp_number !== undefined) request.wpNumber = safeString(dto.wp_number);
    if (dto.box_folder_id !== undefined) request.boxFolderId = safeString(dto.box_folder_id);
    if (dto.assigned_profile !== undefined) request.assignedProfile = safeString(dto.assigned_profile);
    if (dto.user_permissions !== undefined) request.userPermissions = safeString(dto.user_permissions);
    if (dto.mailing_street !== undefined) request.mailingStreet = safeString(dto.mailing_street);
    if (dto.mailing_city !== undefined) request.mailingCity = safeString(dto.mailing_city);
    if (dto.mailing_state !== undefined) request.mailingState = safeString(dto.mailing_state);
    if (dto.mailing_zip !== undefined) request.mailingZip = safeString(dto.mailing_zip);
    if (dto.mailing_country !== undefined) request.mailingCountry = safeString(dto.mailing_country);
    if (dto.ownerId !== undefined) request.ownerId = safeString(dto.ownerId);

    return request;
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
