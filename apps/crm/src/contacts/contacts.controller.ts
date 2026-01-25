import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GrpcErrorMapper } from '../common';
import { ContactsService } from './contacts.service';
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

@Controller()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateContact:
   * 1. Client sends gRPC CreateContactRequest via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC)
   * 3. This method receives request + user metadata
   * 4. Maps proto request to DTO
   * 5. Calls ContactsService.create() with DTO + user context
   * 6. Service returns ContactResponseDto
   * 7. Maps DTO to proto ContactResponse
   * 8. Returns proto response to API Gateway
   * 9. API Gateway transforms to HTTP response
   */
  @GrpcMethod('ContactsService', 'CreateContact')
  async createContact(
    data: CreateContactRequest,
    metadata: Metadata,
  ): Promise<ContactResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createContactDto = this.mapCreateRequestToDto(data);
      const result = await this.contactsService.create(createContactDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM ContactsController.createContact:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllContacts:
   * 1. Client sends HTTP GET /contacts?page=1&limit=10 via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC PaginationRequest)
   * 3. This method receives pagination request
   * 4. Calls ContactsService.findAll() with pagination DTO
   * 5. Service returns paginated ContactResponseDto[]
   * 6. Maps DTOs to proto ContactResponse[]
   * 7. Returns PaginatedContactsResponse to API Gateway
   * 8. API Gateway transforms to HTTP response with pagination metadata
   */
  @GrpcMethod('ContactsService', 'FindAllContacts')
  async findAllContacts(data: PaginationRequest): Promise<PaginatedContactsResponse> {
    try {
      // Ensure page and limit are numbers with defaults
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page), // Ensure page is at least 1
        limit: Math.max(1, Math.min(100, limit)), // Ensure limit is between 1 and 100
      };
      const result = await this.contactsService.findAll(paginationDto);
      
      // Ensure result.data exists and is an array
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from ContactsService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(contact => this.mapResponseDtoToProto(contact)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllContacts:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('ContactsService', 'FindOneContact')
  async findOneContact(data: FindOneContactRequest): Promise<ContactResponse> {
    try {
      const result = await this.contactsService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM ContactsController.findOneContact for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('ContactsService', 'UpdateContact')
  async updateContact(
    data: UpdateContactRequest,
    metadata: Metadata,
  ): Promise<ContactResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateContactDto = this.mapUpdateRequestToDto(data);
      const result = await this.contactsService.update(data.id, updateContactDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM ContactsController.updateContact for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('ContactsService', 'DeleteContact')
  async deleteContact(data: DeleteContactRequest): Promise<DeleteContactResponse> {
    try {
      await this.contactsService.remove(data.id);
      return { success: true };
    } catch (error) {
      console.error(`Error in CRM ContactsController.deleteContact for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('ContactsService', 'BulkDeleteContacts')
  async bulkDeleteContacts(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.contactsService.bulkRemove(bulkDeleteDto);
      return {
        deletedCount: result.deletedCount,
        failedIds: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in CRM ContactsController.bulkDeleteContacts:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('ContactsService', 'BulkUpdateContacts')
  async bulkUpdateContacts(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateContactDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.updateFields),
      };
      const result = await this.contactsService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updatedCount: result.updatedCount,
        failedItems: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in CRM ContactsController.bulkUpdateContacts:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  private extractUserFromMetadata(metadata: Metadata): { id: string; name: string; email: string } {
    const userId = metadata.get('user-id')[0] as string;
    const userName = metadata.get('user-name')[0] as string;
    const userEmail = metadata.get('user-email')[0] as string;

    if (!userId || !userName || !userEmail) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'User information missing from metadata',
      });
    }

    return {
      id: userId,
      name: userName,
      email: userEmail,
    };
  }

  private mapCreateRequestToDto(data: CreateContactRequest): CreateContactDto {
    // Validate required fields are present and not empty strings
    const missingFields: string[] = [];
    if (!data.firstName) missingFields.push('firstName');
    if (!data.lastName) missingFields.push('lastName');
    if (!data.email) missingFields.push('email');

    if (missingFields.length > 0) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: `Required fields missing or empty: ${missingFields.join(', ')} are required`,
      });
    }

    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      // Optional fields - use safeValue to convert empty strings to undefined
      salutation: safeValue(data.salutation),
      phone: safeValue(data.phone),
      mobile_phone: safeValue(data.mobilePhone),
      ownerId: safeValue(data.ownerId),
      accountId: safeValue(data.accountId),
      department: safeValue(data.department),
      governmentCode: safeValue(data.governmentCode),
      territory: safeValue(data.territory),
      secondary_phone: safeValue(data.secondaryPhone),
      assistant_name: safeValue(data.assistantName),
      currency_code: safeValue(data.currencyCode),
      username: safeValue(data.username),
      wp_number: safeValue(data.wpNumber),
      box_folder_id: safeValue(data.boxFolderId),
      assigned_profile: safeValue(data.assignedProfile),
      user_permissions: safeValue(data.userPermissions),
      mailing_street: safeValue(data.mailingStreet),
      mailing_city: safeValue(data.mailingCity),
      mailing_state: safeValue(data.mailingState),
      mailing_zip: safeValue(data.mailingZip),
      mailing_country: safeValue(data.mailingCountry),
    };
  }

  private mapUpdateRequestToDto(data: UpdateContactRequest): UpdateContactDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      salutation: safeValue(data.salutation),
      first_name: safeValue(data.firstName),
      last_name: safeValue(data.lastName),
      phone: safeValue(data.phone),
      mobile_phone: safeValue(data.mobilePhone),
      accountId: safeValue(data.accountId),
      department: safeValue(data.department),
      governmentCode: safeValue(data.governmentCode),
      territory: safeValue(data.territory),
      secondary_phone: safeValue(data.secondaryPhone),
      assistant_name: safeValue(data.assistantName),
      currency_code: safeValue(data.currencyCode),
      username: safeValue(data.username),
      wp_number: safeValue(data.wpNumber),
      box_folder_id: safeValue(data.boxFolderId),
      assigned_profile: safeValue(data.assignedProfile),
      user_permissions: safeValue(data.userPermissions),
      mailing_street: safeValue(data.mailingStreet),
      mailing_city: safeValue(data.mailingCity),
      mailing_state: safeValue(data.mailingState),
      mailing_zip: safeValue(data.mailingZip),
      mailing_country: safeValue(data.mailingCountry),
      ownerId: safeValue(data.ownerId),
    };
  }

  private mapUpdateFieldsToDto(fields: any): UpdateContactDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      salutation: safeValue(fields.salutation),
      first_name: safeValue(fields.firstName),
      last_name: safeValue(fields.lastName),
      phone: safeValue(fields.phone),
      mobile_phone: safeValue(fields.mobilePhone),
      accountId: safeValue(fields.accountId),
      department: safeValue(fields.department),
      governmentCode: safeValue(fields.governmentCode),
      territory: safeValue(fields.territory),
      secondary_phone: safeValue(fields.secondaryPhone),
      assistant_name: safeValue(fields.assistantName),
      currency_code: safeValue(fields.currencyCode),
      username: safeValue(fields.username),
      wp_number: safeValue(fields.wpNumber),
      box_folder_id: safeValue(fields.boxFolderId),
      assigned_profile: safeValue(fields.assignedProfile),
      user_permissions: safeValue(fields.userPermissions),
      mailing_street: safeValue(fields.mailingStreet),
      mailing_city: safeValue(fields.mailingCity),
      mailing_state: safeValue(fields.mailingState),
      mailing_zip: safeValue(fields.mailingZip),
      mailing_country: safeValue(fields.mailingCountry),
      ownerId: safeValue(fields.ownerId),
    };
  }

  private mapResponseDtoToProto(dto: any): ContactResponse {
    return {
      id: dto.id,
      salutation: dto.salutation ?? '',
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email,
      phone: dto.phone ?? '',
      mobilePhone: dto.mobile_phone ?? '',
      department: dto.department ?? '',
      governmentCode: dto.government_code ?? '',
      territory: dto.territory ?? '',
      secondaryPhone: dto.secondary_phone ?? '',
      assistantName: dto.assistant_name ?? '',
      currencyCode: dto.currency_code ?? '',
      username: dto.username ?? '',
      wpNumber: dto.wp_number ?? '',
      boxFolderId: dto.box_folder_id ?? '',
      assignedProfile: dto.assigned_profile ?? '',
      userPermissions: dto.user_permissions ?? '',
      mailingStreet: dto.mailing_street ?? '',
      mailingCity: dto.mailing_city ?? '',
      mailingState: dto.mailing_state ?? '',
      mailingZip: dto.mailing_zip ?? '',
      mailingCountry: dto.mailing_country ?? '',
      createdAt: dto.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: dto.updatedAt?.toISOString() || new Date().toISOString(),
      ownerData: dto.OwnerData ? {
        id: dto.OwnerData.id,
        firstName: dto.OwnerData.firstName,
        lastName: dto.OwnerData.lastName,
      } : undefined,
      createdBy: dto.Created_by,
      modifiedBy: dto.Modified_by,
      accountDetails: dto.Account_details ? {
        id: dto.Account_details.id,
        name: dto.Account_details.name,
        accountNumber: dto.Account_details.accountNumber,
      } : undefined,
      deals: (dto.Deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
      })),
      activities: (dto.Activities || []).map(activity => ({
        id: activity.id,
        activityType: activity.activityType,
        subject: activity.subject,
      })),
    };
  }
}
