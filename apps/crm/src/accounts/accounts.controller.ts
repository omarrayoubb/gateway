import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GrpcErrorMapper } from '../common';
import { AccountsService } from './accounts.service';
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

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateAccount:
   * 1. Client sends gRPC CreateAccountRequest via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC)
   * 3. This method receives request + user metadata
   * 4. Maps proto request to DTO
   * 5. Calls AccountsService.create() with DTO + user context
   * 6. Service returns AccountCreateResponse
   * 7. Maps DTO to proto AccountResponse
   * 8. Returns proto response to API Gateway
   * 9. API Gateway transforms to HTTP response
   */
  @GrpcMethod('AccountsService', 'CreateAccount')
  async createAccount(
    data: CreateAccountRequest,
    metadata: Metadata,
  ): Promise<AccountResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createAccountDto = this.mapCreateRequestToDto(data);
      const result = await this.accountsService.create(createAccountDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM AccountsController.createAccount:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllAccounts:
   * 1. Client sends HTTP GET /accounts?page=1&limit=10 via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC PaginationRequest)
   * 3. This method receives pagination request
   * 4. Calls AccountsService.findAll() with pagination DTO
   * 5. Service returns paginated AccountCreateResponse[]
   * 6. Maps DTOs to proto AccountResponse[]
   * 7. Returns PaginatedAccountsResponse to API Gateway
   * 8. API Gateway transforms to HTTP response with pagination metadata
   */
  @GrpcMethod('AccountsService', 'FindAllAccounts')
  async findAllAccounts(data: PaginationRequest): Promise<PaginatedAccountsResponse> {
    try {
      // Ensure page and limit are numbers with defaults
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page), // Ensure page is at least 1
        limit: Math.max(1, Math.min(100, limit)), // Ensure limit is between 1 and 100
      };
      const result = await this.accountsService.findAll(paginationDto);
      
      // Ensure result.data exists and is an array
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from AccountsService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(account => this.mapResponseDtoToProto(account)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllAccounts:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('AccountsService', 'FindOneAccount')
  async findOneAccount(data: FindOneAccountRequest): Promise<AccountResponse> {
    try {
      const result = await this.accountsService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM AccountsController.findOneAccount for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('AccountsService', 'UpdateAccount')
  async updateAccount(
    data: UpdateAccountRequest,
    metadata: Metadata,
  ): Promise<AccountResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateAccountDto = this.mapUpdateRequestToDto(data);
      const result = await this.accountsService.update(data.id, updateAccountDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM AccountsController.updateAccount for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('AccountsService', 'DeleteAccount')
  async deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    try {
      await this.accountsService.remove(data.id);
      return { success: true };
    } catch (error) {
      console.error(`Error in CRM AccountsController.deleteAccount for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('AccountsService', 'BulkDeleteAccounts')
  async bulkDeleteAccounts(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.accountsService.bulkRemove(bulkDeleteDto);
      return {
        deletedCount: result.deletedCount,
        failedIds: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in CRM AccountsController.bulkDeleteAccounts:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('AccountsService', 'BulkUpdateAccounts')
  async bulkUpdateAccounts(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateAccountDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.updateFields),
      };
      const result = await this.accountsService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updatedCount: result.updatedCount,
        failedItems: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in CRM AccountsController.bulkUpdateAccounts:', error);
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

  private mapCreateRequestToDto(data: CreateAccountRequest): CreateAccountDto {
    // Validate required fields are present and not empty strings
    const missingFields: string[] = [];
    if (!data.name) missingFields.push('name');
    if (!data.phone) missingFields.push('phone');
    if (!data.userIds || data.userIds.length === 0) missingFields.push('userIds');

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
      name: data.name,
      phone: data.phone,
      userIds: data.userIds || [],
      accountNumber: safeValue(data.accountNumber),
      website: safeValue(data.website),
      billing_street: safeValue(data.billingStreet),
      billing_city: safeValue(data.billingCity),
      billing_state: safeValue(data.billingState),
      billing_zip: safeValue(data.billingZip),
      billing_country: safeValue(data.billingCountry),
      shipping_street: safeValue(data.shippingStreet),
      shipping_city: safeValue(data.shippingCity),
      shipping_state: safeValue(data.shippingState),
      shipping_zip: safeValue(data.shippingZip),
      shipping_country: safeValue(data.shippingCountry),
      territory: safeValue(data.territory),
      industry: safeValue(data.industry),
      accountType: safeValue(data.accountType),
      ownership: safeValue(data.ownership),
      parentAccountId: safeValue(data.parentAccountId),
    };
  }

  private mapUpdateRequestToDto(data: UpdateAccountRequest): UpdateAccountDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      name: safeValue(data.name),
      phone: safeValue(data.phone),
      website: safeValue(data.website),
      billing_street: safeValue(data.billingStreet),
      billing_city: safeValue(data.billingCity),
      billing_state: safeValue(data.billingState),
      billing_zip: safeValue(data.billingZip),
      billing_country: safeValue(data.billingCountry),
      shipping_street: safeValue(data.shippingStreet),
      shipping_city: safeValue(data.shippingCity),
      shipping_state: safeValue(data.shippingState),
      shipping_zip: safeValue(data.shippingZip),
      shipping_country: safeValue(data.shippingCountry),
      territory: safeValue(data.territory),
      industry: safeValue(data.industry),
      accountType: safeValue(data.accountType),
      ownership: safeValue(data.ownership),
      userIds: data.userIds && data.userIds.length > 0 ? data.userIds : undefined,
      parentAccountId: safeValue(data.parentAccountId),
    };
  }

  private mapUpdateFieldsToDto(fields: any): UpdateAccountDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      name: safeValue(fields.name),
      phone: safeValue(fields.phone),
      website: safeValue(fields.website),
      billing_street: safeValue(fields.billingStreet),
      billing_city: safeValue(fields.billingCity),
      billing_state: safeValue(fields.billingState),
      billing_zip: safeValue(fields.billingZip),
      billing_country: safeValue(fields.billingCountry),
      shipping_street: safeValue(fields.shippingStreet),
      shipping_city: safeValue(fields.shippingCity),
      shipping_state: safeValue(fields.shippingState),
      shipping_zip: safeValue(fields.shippingZip),
      shipping_country: safeValue(fields.shippingCountry),
      territory: safeValue(fields.territory),
      industry: safeValue(fields.industry),
      accountType: safeValue(fields.accountType),
      ownership: safeValue(fields.ownership),
      userIds: fields.userIds && fields.userIds.length > 0 ? fields.userIds : undefined,
      parentAccountId: safeValue(fields.parentAccountId),
    };
  }

  private mapResponseDtoToProto(dto: any): AccountResponse {
    return {
      id: dto.id,
      name: dto.name,
      accountNumber: dto.accountNumber,
      phone: dto.phone ?? undefined,
      website: dto.website ?? undefined,
      billingStreet: dto.billing_street,
      billingCity: dto.billing_city,
      billingState: dto.billing_state ?? undefined,
      billingZip: dto.billing_zip ?? undefined,
      billingCountry: dto.billing_country ?? undefined,
      shippingStreet: dto.shipping_street ?? undefined,
      shippingCity: dto.shipping_city ?? undefined,
      shippingState: dto.shipping_state ?? undefined,
      shippingZip: dto.shipping_zip ?? undefined,
      shippingCountry: dto.shipping_country ?? undefined,
      territory: dto.territory ?? undefined,
      industry: dto.industry ?? undefined,
      accountType: dto.accountType ?? undefined,
      ownership: dto.ownership ?? undefined,
      parentAccountId: dto.parentAccountId ?? undefined,
      createdAt: dto.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: dto.updatedAt?.toISOString() || new Date().toISOString(),
      createdBy: dto.Created_by || '',
      modifiedBy: dto.Modified_by || '',
      users: (dto.Users || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email ?? undefined,
      })),
      contacts: (dto.Contacts || []).map((contact: any) => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
      })),
      leads: (dto.Leads || []).map((lead: any) => ({
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
      })),
      deals: (dto.Deals || []).map((deal: any) => ({
        id: deal.id,
        name: deal.name,
      })),
      parentAccount: dto.parent_accounts ? {
        id: dto.parent_accounts.id,
        name: dto.parent_accounts.name,
        accountNumber: dto.parent_accounts.accountNumber,
      } : undefined,
    };
  }
}
