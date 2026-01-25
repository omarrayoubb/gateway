import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LeadsService } from './leads.service';
import { Metadata } from '@grpc/grpc-js';
import { GrpcErrorMapper } from '../common';
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
import { User } from 'apps/accounts/src/users.entity';

@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateLead:
   * 1. Client sends gRPC CreateLeadRequest via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC)
   * 3. This method receives request + user metadata
   * 4. Maps proto request to DTO
   * 5. Calls LeadsService.create() with DTO + user context
   * 6. Service returns LeadResponseDto
   * 7. Maps DTO to proto LeadResponse
   * 8. Returns proto response to API Gateway
   * 9. API Gateway transforms to HTTP response
   */
  @GrpcMethod('LeadsService', 'CreateLead')
  async createLead(
    data: CreateLeadRequest,
    metadata: Metadata,
  ): Promise<LeadResponse> {
    try {
      const currentUser = this.extractUserFromMetadata(metadata);
      const createLeadDto = this.mapCreateRequestToDto(data);
      const result = await this.leadsService.create(createLeadDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM LeadsController.createLead:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllLeads:
   * 1. Client sends HTTP GET /leads?page=1&limit=10 via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC PaginationRequest)
   * 3. This method receives pagination request
   * 4. Calls LeadsService.findAll() with pagination DTO
   * 5. Service returns paginated LeadResponseDto[]
   * 6. Maps DTOs to proto LeadResponse[]
   * 7. Returns PaginatedLeadsResponse to API Gateway
   * 8. API Gateway transforms to HTTP response with pagination metadata
   */
  @GrpcMethod('LeadsService', 'FindAllLeads')
  async findAllLeads(data: PaginationRequest): Promise<PaginatedLeadsResponse> {
    try {
      // Ensure page and limit are numbers with defaults
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page), // Ensure page is at least 1
        limit: Math.max(1, Math.min(100, limit)), // Ensure limit is between 1 and 100
      };
      const result = await this.leadsService.findAll(paginationDto);
      
      // Ensure result.data exists and is an array
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from LeadsService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(lead => this.mapResponseDtoToProto(lead)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllLeads:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('LeadsService', 'FindOneLead')
  async findOneLead(data: FindOneLeadRequest): Promise<LeadResponse> {
    try {
      const result = await this.leadsService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM LeadsController.findOneLead for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('LeadsService', 'UpdateLead')
  async updateLead(
    data: UpdateLeadRequest,
    metadata: Metadata,
  ): Promise<LeadResponse> {
    try {
      const currentUser = this.extractUserFromMetadata(metadata);
      const updateLeadDto = this.mapUpdateRequestToDto(data);
      const result = await this.leadsService.update(data.id, updateLeadDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM LeadsController.updateLead for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('LeadsService', 'DeleteLead')
  async deleteLead(data: DeleteLeadRequest): Promise<DeleteLeadResponse> {
    try {
      await this.leadsService.remove(data.id);
      return { success: true };
    } catch (error) {
      console.error(`Error in CRM LeadsController.deleteLead for ID ${data.id}:`, error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('LeadsService', 'BulkDeleteLeads')
  async bulkDeleteLeads(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.leadsService.bulkRemove(bulkDeleteDto);
      return {
        deletedCount: result.deletedCount,
        failedIds: result.failedIds,
      };
    } catch (error) {
      console.error('Error in CRM LeadsController.bulkDeleteLeads:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('LeadsService', 'BulkUpdateLeads')
  async bulkUpdateLeads(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateLeadDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.updateFields),
      };
      const result = await this.leadsService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updatedCount: result.updatedCount,
        failedItems: result.failedItems,
      };
    } catch (error) {
      console.error('Error in CRM LeadsController.bulkUpdateLeads:', error);
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

  private mapCreateRequestToDto(data: CreateLeadRequest): CreateLeadDto {
    // Validate required fields are present and not empty strings
    const missingFields: string[] = [];
    if (!data.firstName) missingFields.push('firstName');
    if (!data.lastName) missingFields.push('lastName');
    if (!data.phone) missingFields.push('phone');
    if (!data.email) missingFields.push('email');
    if (!data.shippingStreet) missingFields.push('shippingStreet');
    if (!data.billingCity) missingFields.push('billingCity');

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
      phone: data.phone,
      email: data.email,
      shipping_street: data.shippingStreet,
      billing_city: data.billingCity,
      // Optional fields - use safeValue to convert empty strings to undefined
      ownerId: safeValue(data.ownerId),
      salutation: safeValue(data.salutation),
      accountId: safeValue(data.accountId),
      product_name: safeValue(data.productName),
      currency_code: safeValue(data.currencyCode),
      employee_count: safeValue(data.employeeCount),
      hq_code: safeValue(data.hqCode),
      billing_amount: safeValue(data.billingAmount),
      exchange_rate: safeValue(data.exchangeRate),
      shipping_street_2: safeValue(data.shippingStreet2),
      shipping_city: safeValue(data.shippingCity),
      shipping_state: safeValue(data.shippingState),
      shipping_country: safeValue(data.shippingCountry),
      shipping_zip_code: safeValue(data.shippingZipCode),
      billing_street: safeValue(data.billingStreet),
      billing_street_2: safeValue(data.billingStreet2),
      billing_state: safeValue(data.billingState),
      billing_country: safeValue(data.billingCountry),
      billing_zip_code: safeValue(data.billingZipCode),
    };
  }

  private mapUpdateRequestToDto(data: UpdateLeadRequest): UpdateLeadDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      salutation: safeValue(data.salutation),
      first_name: safeValue(data.firstName),
      last_name: safeValue(data.lastName),
      phone: safeValue(data.phone),
      email: safeValue(data.email),
      shipping_street: safeValue(data.shippingStreet),
      billing_city: safeValue(data.billingCity),
      accountId: safeValue(data.accountId),
      product_name: safeValue(data.productName),
      currency_code: safeValue(data.currencyCode),
      employee_count: safeValue(data.employeeCount),
      hq_code: safeValue(data.hqCode),
      billing_amount: safeValue(data.billingAmount),
      exchange_rate: safeValue(data.exchangeRate),
      shipping_street_2: safeValue(data.shippingStreet2),
      shipping_city: safeValue(data.shippingCity),
      shipping_state: safeValue(data.shippingState),
      shipping_country: safeValue(data.shippingCountry),
      shipping_zip_code: safeValue(data.shippingZipCode),
      billing_street: safeValue(data.billingStreet),
      billing_street_2: safeValue(data.billingStreet2),
      billing_state: safeValue(data.billingState),
      billing_country: safeValue(data.billingCountry),
      billing_zip_code: safeValue(data.billingZipCode),
      ownerId: safeValue(data.ownerId),
    };
  }

  private mapUpdateFieldsToDto(fields: any): UpdateLeadDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    return {
      salutation: safeValue(fields.salutation),
      first_name: safeValue(fields.first_name),
      last_name: safeValue(fields.last_name),
      phone: safeValue(fields.phone),
      shipping_street: safeValue(fields.shipping_street),
      billing_city: safeValue(fields.billing_city),
      accountId: safeValue(fields.accountId),
      product_name: safeValue(fields.product_name),
      currency_code: safeValue(fields.currency_code),
      employee_count: safeValue(fields.employee_count),
      hq_code: safeValue(fields.hq_code),
      billing_amount: safeValue(fields.billing_amount),
      exchange_rate: safeValue(fields.exchange_rate),
      shipping_street_2: safeValue(fields.shipping_street_2),
      shipping_city: safeValue(fields.shipping_city),
      shipping_state: safeValue(fields.shipping_state),
      shipping_country: safeValue(fields.shipping_country),
      shipping_zip_code: safeValue(fields.shipping_zip_code),
      billing_street: safeValue(fields.billing_street),
      billing_street_2: safeValue(fields.billing_street_2),
      billing_state: safeValue(fields.billing_state),
      billing_country: safeValue(fields.billing_country),
      billing_zip_code: safeValue(fields.billing_zip_code),
      ownerId: safeValue(fields.owner_id),
    };
  }

  private mapResponseDtoToProto(dto: any): LeadResponse {
    return {
      id: dto.id,
      salutation: dto.salutation ?? '',
      firstName: dto.first_name,
      lastName: dto.last_name,
      phone: dto.phone,
      email: dto.email,
      shippingStreet: dto.shipping_street,
      billingCity: dto.billing_city,
      productName: dto.product_name ?? '',
      currencyCode: dto.currency_code ?? '',
      employeeCount: dto.employee_count ?? 0,
      hqCode: dto.hq_code ?? '',
      billingAmount: dto.billing_amount ?? 0,
      exchangeRate: dto.exchange_rate ?? 0,
      shippingStreet2: dto.shipping_street_2 ?? '',
      shippingCity: dto.shipping_city ?? '',
      shippingState: dto.shipping_state ?? '',
      shippingCountry: dto.shipping_country ?? '',
      shippingZipCode: dto.shipping_zip_code ?? '',
      billingStreet: dto.billing_street ?? '',
      billingStreet2: dto.billing_street_2 ?? '',
      billingState: dto.billing_state ?? '',
      billingCountry: dto.billing_country ?? '',
      billingZipCode: dto.billing_zip_code ?? '',
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
